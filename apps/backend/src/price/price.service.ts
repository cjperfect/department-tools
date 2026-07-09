import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JustOneService } from '../justone/justone.service';
import { parseProductUrl } from '../justone/url-parser';

@Injectable()
export class PriceService {
  constructor(
    private prisma: PrismaService,
    private justone: JustOneService,
  ) {}

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

    return { code: 0, message: 'ok', data: output };
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

    for (const itemData of itemsData) {
      let currentPrice = 0;
      if (itemData.url) {
        const parsed = parseProductUrl(itemData.url);
        if (parsed?.isSupported && this.justone.isAvailable) {
          const raw = await this.justone.getProductDetail(
            parsed.platform,
            parsed.productId,
          );
          if (raw) {
            currentPrice = this.extractPrice(raw);
          }
        }
      }
      const target = itemData.targetPrice;
      const diff = currentPrice - target;
      const status = currentPrice > 0 && currentPrice <= target ? 1 : 0;

      await this.prisma.monitorItem.create({
        data: {
          product_id: product.id,
          platform: itemData.platform,
          url: itemData.url || '',
          current_price: currentPrice,
          target_price: target,
          diff,
          status,
        },
      });
    }

    return { code: 0, message: '监控已添加', data: await this.loadProduct(product.id) };
  }

  async deleteProduct(userId: number, productId: number) {
    const product = await this.prisma.monitorProduct.findFirst({
      where: { id: productId, user_id: userId },
    });
    if (!product) throw new NotFoundException('记录不存在');
    await this.prisma.monitorProduct.delete({ where: { id: productId } });
    return { code: 0, message: '已删除', data: null };
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
    return { code: 0, message: '已删除', data: null };
  }

  async getStats() {
    const [total, triggered, down, up] = await Promise.all([
      this.prisma.monitorItem.count(),
      this.prisma.monitorItem.count({ where: { status: 1 } }),
      this.prisma.monitorItem.count({ where: { diff: { lt: 0 } } }),
      this.prisma.monitorItem.count({ where: { diff: { gt: 0 } } }),
    ]);

    return {
      code: 0,
      message: 'ok',
      data: {
        total,
        monitoring: total - triggered,
        triggered,
        priceDown: down,
        priceUp: up,
      },
    };
  }

  async refreshItem(itemId: number) {
    const item = await this.prisma.monitorItem.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException('记录不存在');

    if (item.url && this.justone.isAvailable) {
      const parsed = parseProductUrl(item.url);
      if (parsed?.isSupported) {
        const raw = await this.justone.getProductDetail(
          parsed.platform,
          parsed.productId,
        );
        if (raw) {
          item.current_price = this.extractPrice(raw);
        }
      }
    }

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

    return {
      code: 0,
      message: 'ok',
      data: this.itemToDict({ ...item, diff, status }),
    };
  }

  async searchCompare(userId: number, keyword: string) {
    if (!keyword.trim()) {
      return { code: 0, message: 'ok', data: [] };
    }

    const items = await this.prisma.monitorItem.findMany({
      where: {
        product: {
          name: { contains: keyword.trim() },
          user_id: userId,
        },
      },
      include: { product: true },
      orderBy: { current_price: 'asc' },
    });

    const grouped: Record<string, any[]> = {};
    for (const it of items) {
      if (!grouped[it.platform]) grouped[it.platform] = [];
      grouped[it.platform].push({
        name: it.product.name,
        price: it.current_price,
        shop: it.platform,
        url: it.url || '',
      });
    }

    const result = Object.entries(grouped).map(([platform, its]) => ({
      platform,
      items: its.sort((a, b) => a.price - b.price),
    }));

    return { code: 0, message: 'ok', data: result };
  }

  // 占位端点
  async getCompare(itemId: number) {
    return {
      code: 0,
      message: 'ok',
      data: { id: itemId, name: '', prices: [] },
    };
  }

  async getHistory(itemId: number) {
    return {
      code: 0,
      message: 'ok',
      data: { id: itemId, name: '', data: [] },
    };
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

  private extractPrice(raw: any): number {
    for (const key of ['DiscountPrice', 'itemPrice']) {
      const v = raw[key];
      if (v != null) {
        const p = parseFloat(v);
        if (!isNaN(p)) return p > 1000 ? p / 100 : p;
      }
    }
    for (const key of ['price', 'current_price', 'sale_price']) {
      const v = raw[key];
      if (v != null) {
        const p = parseFloat(v);
        if (!isNaN(p)) return p;
      }
    }
    return 0;
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
