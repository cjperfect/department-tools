import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JustOneService } from '../justone/justone.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PriceService {
  constructor(
    private prisma: PrismaService,
    private justone: JustOneService,
  ) {};

  async getList(userId: number) {
    const products = await this.prisma.monitorProduct.findMany({
      where: { user_id: userId },
      include: { items: true },
      orderBy: { created_at: 'desc' },
    });

    const output = products.map((p) => {
      const best: Record<string, any> = {};
      for (const it of p.items) {
        const d = this.itemToDict(it);
        const plat = d.platform;
        if (!best[plat] || d.currentPrice < best[plat].currentPrice) {
          best[plat] = d;
        }
      }
      return {
        id: p.id,
        name: p.name,
        image: p.image,
        items: Object.values(best).sort(
          (a: any, b: any) => a.currentPrice - b.currentPrice,
        ),
      };
    });

    return output;
  }

  async addMonitor(
    userId: number,
    name: string,
    itemsData: Array<{
      platform: string;
      url: string;
      targetPrice: number;
    }>,
  ) {
    if (!itemsData.length) throw new BadRequestException('至少选择一个平台');

    const productName = name.trim() || '未命名产品';
    const product = await this.prisma.monitorProduct.create({
      data: {
        user_id: userId,
        name: productName,
        image: this.guessIcon(productName),
      },
    });

    // 收集第一个 API 返回的图片，用于覆盖 emoji icon
    let apiImage = '';

    for (const itemData of itemsData) {
      let currentPrice = 0;
      let url = itemData.url || '';
      let image = '';

      const justoneKey = itemData.platform;

      if (justoneKey) {
        try {
          const first = await this.justone.searchFirstProduct(justoneKey, productName);
          if (first) {
            currentPrice = first.price;
            if (first.url) url = first.url;
            if (first.image) image = first.image;
          }
        } catch {
          // API 调用失败静默 fallback，price/url/image 保持默认值
        }
      }

      const target = itemData.targetPrice;
      const diff = currentPrice - target;
      const status = currentPrice > 0 && currentPrice <= target ? 1 : 0;

      if (image && !apiImage) apiImage = image;

      await this.prisma.monitorItem.create({
        data: {
          product_id: product.id,
          platform: itemData.platform,
          url,
          current_price: currentPrice,
          target_price: target,
          diff,
          status,
        },
      });
    }

    // 用 API 返回的真实图片替换 emoji
    if (apiImage) {
      await this.prisma.monitorProduct.update({
        where: { id: product.id },
        data: { image: apiImage },
      });
    }

    return await this.loadProduct(product.id);
  }

  async deleteProduct(userId: number, productId: number) {
    const product = await this.prisma.monitorProduct.findFirst({
      where: { id: productId, user_id: userId },
    });
    if (!product) throw new NotFoundException('记录不存在');
    await this.prisma.monitorProduct.delete({ where: { id: productId } });
    return null;
  }

  async deleteItem(userId: number, itemId: number) {
    const item = await this.prisma.monitorItem.findFirst({
      where: { id: itemId },
      include: { product: true },
    });
    if (!item || item.product.user_id !== userId) {
      throw new NotFoundException('记录不存在');
    }
    const productId = item.product_id;
    await this.prisma.monitorItem.delete({ where: { id: itemId } });

    // 检查产品是否还有平台项
    const remaining = await this.prisma.monitorItem.count({
      where: { product_id: productId },
    });
    if (remaining === 0) {
      await this.prisma.monitorProduct.delete({ where: { id: productId } });
    }
    return null;
  }

  async getStats() {
    const [total, triggered, down, up] = await Promise.all([
      this.prisma.monitorItem.count(),
      this.prisma.monitorItem.count({ where: { status: 1 } }),
      this.prisma.monitorItem.count({ where: { diff: { lt: 0 } } }),
      this.prisma.monitorItem.count({ where: { diff: { gt: 0 } } }),
    ]);

    return {
      total,
      monitoring: total - triggered,
      triggered,
      priceDown: down,
      priceUp: up,
    };
  }

  async refreshItem(itemId: number) {
    const item = await this.prisma.monitorItem.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException('记录不存在');

    const diff = item.current_price - item.target_price;
    const status = item.current_price > 0 && item.current_price <= item.target_price ? 1 : 0;

    await this.prisma.monitorItem.update({
      where: { id: itemId },
      data: {
        current_price: item.current_price,
        diff,
        status,
      },
    });

    return this.itemToDict({ ...item, diff, status });
  }

  async searchCompare(userId: number, productId: number) {
    const product = await this.prisma.monitorProduct.findFirst({
      where: { id: productId, user_id: userId },
    });

    if (!product) {
      return { itemList: [], pageSize: 0 };
    }

    // 尝试通过 JustOne API 搜索真实数据
    if (this.justone.isAvailable) {
      const result = await this.justone.searchProducts('taobao', product.name);
      if (result?.itemList?.length) {
        const itemList = result.itemList.map((item: any) => ({
          name: item.itemName || '',
          price: item.priceYuanDouble ?? 0,
          shop: item.shopName || '',
          url: `https://item.taobao.com/item.htm?id=${item.itemId}`,
          image: item.picUrlFull || '',
        }));
        return { itemList, pageSize: itemList.length };
      }
    }

    // 兜底：读取 mock 数据
    const filePath = path.resolve(__dirname, '../../../../testApi/mock/taobao_search.json');
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const model = raw?.data?.model;
    const itemList = (model?.itemList || []).map((item: any) => ({
      name: item.itemName || '',
      price: item.priceYuanDouble ?? 0,
      shop: item.shopName || '',
      url: `https://item.taobao.com/item.htm?id=${item.itemId}`,
      image: item.picUrlFull || '',
    }));
    const pageSize = model?.page?.pageSize ?? 10;

    return { itemList, pageSize };
  }

  // 占位端点
  async getCompare(itemId: number) {
    return { id: itemId, name: '', prices: [] };
  }

  async getHistory(itemId: number) {
    return { id: itemId, name: '', data: [] };
  }

  // ------------------------------------------------------------------
  // 内部
  // ------------------------------------------------------------------

  private async loadProduct(productId: number) {
    const product = await this.prisma.monitorProduct.findUnique({
      where: { id: productId },
      include: { items: true },
    });
    return {
      id: product!.id,
      name: product!.name,
      image: product!.image,
      items: product!.items.map((i) => this.itemToDict(i)),
    };
  }

  private itemToDict(item: any) {
    return {
      id: item.id,
      platform: item.platform,
      url: item.url,
      currentPrice: item.current_price,
      targetPrice: item.target_price,
      diff: item.diff,
      status: item.status,
      statusText: item.status === 1 ? '已触发' : '监控中',
    };
  }

  private guessIcon(name: string): string {
    const icons: Record<string, string> = {
      '耳机': '🎧', '手机': '📱', '电脑': '💻', '笔记本': '💻',
      '显示器': '🖥️', '键盘': '⌨️', '鼠标': '🖱️',
      '手表': '⌚', '音箱': '🔊', '相机': '📷', '游戏': '🎮',
      '咖啡': '☕', '鞋': '👟', '衣服': '👕', '包': '🎒',
    };
    for (const [kw, icon] of Object.entries(icons)) {
      if (name.includes(kw)) return icon;
    }
    return '📦';
  }
}
