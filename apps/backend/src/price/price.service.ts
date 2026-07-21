import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JustOneService } from '../justone/justone.service';
import { guessIcon } from '../utils/product-icon';

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
      createdAt: p.created_at,
      items: p.items.map((it) => this.itemToDict(it)),
    }));
  }

  async addMonitor(
    userId: number,
    name: string,
    itemsData: Array<{ platform: string; targetPrice: number }>,
  ) {
    if (!itemsData.length) throw new BadRequestException('至少选择一个平台');

    const productName = name.trim() || '未命名产品';
    const product = await this.prisma.monitorProduct.create({
      data: {
        user_id: userId,
        keyword: productName,
        image: guessIcon(productName),
        configs: itemsData,
      },
    });

    await this.populateItems(product.id, productName, itemsData);
    return await this.loadProduct(product.id);
  }

  private async populateItems(
    productId: number,
    keyword: string,
    itemsData: Array<{ platform: string; targetPrice: number }>,
  ) {
    for (const itemData of itemsData) {
      const target = itemData.targetPrice;
      const platform = itemData.platform;
      if (!platform) continue;

      try {
        const result = await this.justone.searchProducts(platform, keyword);
        if (result?.itemList?.length) {
          const formatted = this.formatSearchItems(
            result.itemList.map((item: any) => ({ ...item, _platform: platform })),
          );

          for (const item of formatted) {
            const diff = item.price - target;

            await this.prisma.monitorItem.create({
              data: {
                product_id: productId,
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
  }

  async refreshAll(userId: number) {
    const products = await this.prisma.monitorProduct.findMany({
      where: { user_id: userId },
    });
    for (const product of products) {
      const itemsData = (product.configs as any[]) || [];
      await this.prisma.monitorProduct.deleteMany({
        where: { id: product.id, user_id: userId },
      });
      await this.prisma.monitorItem.deleteMany({
        where: { product_id: product.id },
      });
      await this.addMonitor(userId, product.keyword, itemsData);
    }
    return null;
  }

  async refreshProduct(userId: number, productId: number) {
    const product = await this.prisma.monitorProduct.findFirst({
      where: { id: productId, user_id: userId },
    });
    if (!product) throw new NotFoundException('记录不存在');

    const itemsData = (product.configs as any[]) || [];
    await this.prisma.monitorProduct.deleteMany({
      where: { id: productId, user_id: userId },
    });
    await this.prisma.monitorItem.deleteMany({
      where: { product_id: productId },
    });
    await this.addMonitor(userId, product.keyword, itemsData);
    return null;
  }

  async deleteProduct(userId: number, productId: number) {
    await this.prisma.monitorProduct.deleteMany({
      where: { id: productId, user_id: userId },
    });
    return null;
  }

  async deleteItem(userId: number, itemId: number) {
    const result = await this.prisma.monitorItem.deleteMany({
      where: { id: itemId, product: { user_id: userId } },
    });
    if (result.count === 0) throw new NotFoundException('记录不存在');
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
      include: { product: true },
    });
    if (!item) throw new NotFoundException('记录不存在');
    return this.refreshOneItem(item);
  }

  private async refreshOneItem(item: any) {
    try {
      const result = await this.justone.searchProducts(item.platform, item.product.keyword);
      if (result?.itemList?.length) {
        const formatted = this.formatSearchItems(
          result.itemList.map((it: any) => ({ ...it, _platform: item.platform })),
        );
        const latest = formatted[0];
        if (latest) {
          const diff = latest.price - item.target_price;
          await this.prisma.monitorItem.update({
            where: { id: item.id },
            data: {
              name: latest.name,
              shop_name: latest.shop,
              url: latest.url,
              image: latest.image,
              current_price: latest.price,
              diff,
            },
          });
          return this.itemToDict({ ...item, ...latest, current_price: latest.price, diff });
        }
      }
    } catch {
      // API 调用失败静默 fallback
    }

    // fallback: 仅重新计算 diff
    const diff = item.current_price - item.target_price;
    await this.prisma.monitorItem.update({
      where: { id: item.id },
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
      createdAt: product!.created_at,
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
}
