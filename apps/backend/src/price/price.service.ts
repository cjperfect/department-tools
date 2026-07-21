import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JustOneService } from '../justone/justone.service';

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

    return products.map((p) => ({
      id: p.id,
      keyword: p.keyword,
      image: p.image,
      items: p.items.map((it) => this.itemToDict(it)),
    }));
  }

  async addMonitor(
    userId: number,
    name: string,
    itemsData: Array<{
      platform: string;
      targetPrice: number;
    }>,
  ) {
    if (!itemsData.length) throw new BadRequestException('至少选择一个平台');

    const productName = name.trim() || '未命名产品';
    const product = await this.prisma.monitorProduct.create({
      data: {
        user_id: userId,
        keyword: productName,
        image: this.guessIcon(productName),
      },
    });

    let apiImage = '';

    for (const itemData of itemsData) {
      const target = itemData.targetPrice;
      const platform = itemData.platform;

      if (!platform) continue;

      try {
        const result = await this.justone.searchProducts(platform, productName);
        if (result?.itemList?.length) {
          const formatted = this.formatSearchItems(
            result.itemList.map((item: any) => ({ ...item, _platform: platform })),
          ).slice(0, 10)

          for (const item of formatted) {
            const diff = item.price - target;

            if (item.image && !apiImage) apiImage = item.image;

            await this.prisma.monitorItem.create({
              data: {
                product_id: product.id,
                platform,
                name: item.name,
                shop_name: item.shop,
                url: item.url,
                image: item.image,
                current_price: item.price,
                target_price: target,
                diff,
              },
            });
          }
        }
      } catch {
        // API 调用失败静默 fallback
      }
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
      this.prisma.monitorItem.count({ where: { diff: { lte: 0 } } }),
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

    await this.prisma.monitorItem.update({
      where: { id: itemId },
      data: { diff },
    });

    return this.itemToDict({ ...item, diff });
  }

  private formatSearchItems(items: any[]) {
    return items.map((item: any) => {
      const platform = item._platform || 'taobao';
      switch (platform) {
        case 'taobao':
          return {
            name: item.itemName || '',
            price: item.priceYuanDouble ?? 0,
            shop: item.shopName || '',
            url: item.itemId ? `https://item.taobao.com/item.htm?id=${item.itemId}` : '',
            image: item.picUrl ? `https://img.alicdn.com/imgextra/${item.picUrl}` : '',
            platform,
          };
        case 'jd':
          return {
            name: item.title || '',
            price: parseFloat(item.price) || 0,
            shop: item.shopName || '',
            url: item.click || '',
            image: item.imageUrl ? `https://img10.360buyimg.com/pcpubliccms/${item.imageUrl}` : '',
            platform,
          };
        case 'dy': {
          const baseModel = item.base_model ?? {};
          // origin 是原始价格（单位：分），直接转为元
          const priceYuan = (baseModel.marketing_info?.price_desc?.price?.origin ?? 0) / 100;
          return {
            name: baseModel.product_info?.name || '',
            price: priceYuan,
            shop: baseModel.shop_info?.shop_name || '',
            url: baseModel.product_info?.detail_url || '',
            image: baseModel.product_info?.main_img?.url_list?.[0] || '',
            platform,
          };
        }
        default:
          return {
            name: '', price: 0, shop: '', url: '', image: '',
            platform,
          };
      }
    });
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
      keyword: product!.keyword,
      image: product!.image,
      items: product!.items.map((i) => this.itemToDict(i)),
    };
  }

  private itemToDict(item: any) {
    return {
      id: item.id,
      platform: item.platform,
      url: item.url,
      image: item.image,
      name: item.name || '',
      shopName: item.shop_name || '',
      currentPrice: item.current_price,
      targetPrice: item.target_price,
      diff: item.diff,
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
