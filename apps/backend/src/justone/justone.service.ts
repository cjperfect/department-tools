import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const BASE_URL = 'https://api.justoneapi.com';
const PLATFORM_JD = '京东';
const PLATFORM_TMALL = '天猫';
const PLATFORM_TAOBAO = '淘宝';

@Injectable()
export class JustOneService {
  private readonly logger = new Logger(JustOneService.name);
  private readonly token: string;

  constructor(private configService: ConfigService) {
    this.token = this.configService.get<string>('JUSTONE_API_TOKEN') || '';
  }

  get isAvailable(): boolean {
    return !!this.token;
  }

  // ------------------------------------------------------------------
  // 统一 HTTP 调用
  // ------------------------------------------------------------------

  private async get(path: string, params: Record<string, any> = {}): Promise<any> {
    if (!this.token) return null;
    try {
      const url = new URL(path, BASE_URL);
      url.searchParams.set('token', this.token);
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
  // 商品详情
  // ------------------------------------------------------------------

  async getProductDetail(platform: string, productId: string): Promise<any> {
    if (platform === PLATFORM_TMALL || platform === PLATFORM_TAOBAO) {
      const data = await this.get('/api/taobao/get-item-detail/v4', { itemId: productId });
      return data;
    }
    if (platform === PLATFORM_JD) {
      const data = await this.get('/api/jd/get-item-detail/v2', { itemId: productId });
      return data?.item || data;
    }
    return null;
  }

  // ------------------------------------------------------------------
  // 商品评论
  // ------------------------------------------------------------------

  async getProductComments(platform: string, productId: string): Promise<any> {
    if (platform === PLATFORM_TMALL || platform === PLATFORM_TAOBAO) {
      return this.get('/api/taobao/get-item-comment/v3', { itemId: productId, page: 1 });
    }
    if (platform === PLATFORM_JD) {
      return this.get('/api/jd/get-item-comments/v2', { itemId: productId });
    }
    return null;
  }

  // ------------------------------------------------------------------
  // 商品价格 / 销量
  // ------------------------------------------------------------------

  async getProductPrice(platform: string, productId: string): Promise<any> {
    if (platform === PLATFORM_TMALL || platform === PLATFORM_TAOBAO) {
      return this.get('/api/taobao/get-item-sale/v1', { itemId: productId });
    }
    if (platform === PLATFORM_JD) {
      return this.get('/api/jd/get-item-price/v1', { itemId: productId });
    }
    return null;
  }
}
