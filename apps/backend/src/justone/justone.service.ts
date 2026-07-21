import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const PRODUCTION_BASE_URL = 'https://api.justoneapi.com';

const SEARCH_API: Record<string, string> = {
  taobao: '/api/taobao/search-item-list/v1',
  dy: '/api/douyin-ec/search-item-list/v1',
  jd: '/api/jd/search-item-list/v1',
};

@Injectable()
export class JustOneService {
  private readonly logger = new Logger(JustOneService.name);
  private readonly token: string;

  constructor(private configService: ConfigService) {
    this.token = this.configService.get<string>('JUSTONE_API_TOKEN') || '';
  }

  get isAvailable(): boolean {
    return true;
  }

  private get baseUrl(): string {
    return this.configService.get<string>('JUSTONE_BASE_URL') || PRODUCTION_BASE_URL;
  }

  // ------------------------------------------------------------------
  // HTTP 调用
  // ------------------------------------------------------------------

  private async get(path: string, params: Record<string, any> = {}): Promise<any> {
    try {
      const url = new URL(path, this.baseUrl);
      if (this.token) url.searchParams.set('token', this.token);
      for (const [key, value] of Object.entries(params)) {
        if (value != null) {
          url.searchParams.set(key, String(value));
        }
      }
      const resp = await fetch(url.toString());
      const json = await resp.json();
      if (json.code === 0) return json.data;
      this.logger.warn(`JustOneAPI ${path} failed: code=${json.code} msg=${json.message}`);
      return null;
    } catch (e) {
      this.logger.error(`JustOneAPI ${path} error: ${e}`);
      return null;
    }
  }

  // ------------------------------------------------------------------
  // 商品搜索
  // ------------------------------------------------------------------

  async searchProducts(platform: string, keyword: string): Promise<{
    itemList: any[]
  } | null> {
    const api = SEARCH_API[platform];
    if (!api) return null;
    const data = await this.get(api, { keyword });
    if (!data) return null;

    // 不同平台返回格式不同
    const extractors: Record<string, (d: any) => any[]> = {
      taobao: (d) => d.model?.itemList,
      jd: (d) => d.products,
      dy: (d) => d.summary_promotions,
    };

    const extract = extractors[platform];
    if (!extract) return null;
    const items = extract(data) || [];
    return { itemList: items };
  }

  /**
   * 搜索商品并返回第一条标准化结果，用于快速获取价格/图片/URL。
   * 无结果或失败返回 null。
   */
  async searchFirstProduct(platform: string, keyword: string): Promise<{
    name: string;
    price: number;
    url: string;
    image: string;
    shop: string;
  } | null> {
    const result = await this.searchProducts(platform, keyword);
    if (!result || !result.itemList.length) return null;

    const items = result.itemList;

    switch (platform) {
      case 'jd': {
        const first = items[0];
        return {
          name: first.title ?? '',
          price: parseFloat(first.price) || 0,
          url: first.click ?? '',
          image: first.imageUrl,
          shop: first.shopName ?? '',
        };
      }
      case 'taobao': {
        const first = items[0];
        return {
          name: first.itemName ?? '',
          price: first.priceYuanDouble ?? 0,
          url: '',
          image: first.picUrlFull ?? '',
          shop: first.shopName ?? '',
        };
      }
      case 'dy': {
        const first = items[0];
        const baseModel = first.base_model ?? {};
        const price = baseModel.marketing_info?.price_desc?.price;
        const priceStr = price ? `${price.integer ?? 0}.${price.decimal ?? 0}` : '0';
        return {
          name: baseModel.product_info?.name ?? '',
          price: parseFloat(priceStr) || 0,
          url: baseModel.product_info?.detail_url ?? '',
          image: baseModel.product_info?.main_img?.url_list?.[0] ?? '',
          shop: baseModel.shop_info?.shop_name ?? '',
        };
      }
      default:
        return null;
    }
  }

}
