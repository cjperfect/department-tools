import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JustOneService } from '../justone/justone.service';
import { parseProductUrl } from '../justone/url-parser';

const DIMENSION_TYPES = ['design', 'pricing', 'functionality', 'quality', 'service'];

const EMPTY_DETAIL: Record<string, any> = {
  design: {
    packaging: '', colorOptions: [], sizeOptions: [],
    userLikes: [], userHates: [], gapOpportunities: [],
  },
  pricing: {
    competitorPrice: 0, ourPrice: 0,
    hasFreeTrial: false, hasInstallment: false,
    plans: [], pricingGaps: [],
  },
  functionality: {
    solves: [], gaps: [], painPoints: [],
  },
  quality: {
    easeOfUse: '', durability: '',
    qualityIssues: [],
    userFeedback: { positive: [], negative: [] },
  },
  service: {
    responseStyle: '', avgResponseTime: '',
    commonComplaints: [], serviceLikes: [],
  },
};

@Injectable()
export class BiddingService {
  constructor(
    private prisma: PrismaService,
    private justone: JustOneService,
  ) {}

  async analyze(url: string, userId: number) {
    const parsed = parseProductUrl(url);
    if (!parsed) throw new NotFoundException('未找到该商品');
    if (!parsed.isSupported) throw new BadRequestException(`暂不支持${parsed.platform}平台`);

    if (!this.justone.isAvailable) throw new NotFoundException('API 服务不可用');

    const raw = await this.justone.getProductDetail(parsed.platform, parsed.productId);
    if (!raw) throw new NotFoundException('未找到该商品');

    const rawComments = await this.justone.getProductComments(parsed.platform, parsed.productId);
    const rawPrice = await this.justone.getProductPrice(parsed.platform, parsed.productId);

    const ctx = { raw: raw || {}, comments: rawComments || {} };
    const currentPrice = this.extractPrice(ctx);
    const originalPrice = this.extractOriginalPrice(ctx);

    const analysis = await this.prisma.analysis.create({
      data: {
        user_id: userId,
        url,
        platform: parsed.platform,
        name: this.extractName(ctx),
        image: this.guessIcon(ctx),
        shop_name: this.extractShopName(ctx),
        category: this.extractCategory(ctx),
        current_price: currentPrice,
        original_price: originalPrice !== currentPrice ? originalPrice : null,
        monthly_sales: this.extractSales(ctx),
        rating: this.extractRating(ctx),
        reviews: this.extractReviewCount(ctx),
        highlights: ['商品数据已接入', '支持实时价格查询'],
        warnings: ['AI 深度分析尚未接入'],
        gap_opportunities: ['接入 AI 分析获取竞品差异'],
        analyzed_at: new Date(),
      },
    });

    // 创建 5 个维度记录
    for (const dimType of DIMENSION_TYPES) {
      const detail = { ...EMPTY_DETAIL[dimType] };
      if (dimType === 'pricing') {
        detail.competitorPrice = currentPrice;
        detail.ourPrice = currentPrice;
        detail.plans = [{ name: '标准版', price: currentPrice }];
      }
      await this.prisma.analysisDimension.create({
        data: {
          analysis_id: analysis.id,
          dimension_type: dimType,
          score: 0,
          detail,
        },
      });
    }

    // 保存原始数据
    await this.prisma.rawData.create({
      data: {
        analysis_id: analysis.id,
        data: { detail: raw, comments: rawComments, price: rawPrice },
      },
    });

    return { code: 0, message: '分析完成', data: await this.loadAnalysis(analysis.id) };
  }

  async getRecords(userId: number, query?: string) {
    const where: any = { user_id: userId };
    if (query?.trim()) {
      const q = query.trim();
      where.OR = [
        { name: { contains: q } },
        { platform: { contains: q } },
        { shop_name: { contains: q } },
      ];
    }
    const records = await this.prisma.analysis.findMany({
      where,
      include: { dimensions: true },
      orderBy: { created_at: 'desc' },
    });
    return {
      code: 0,
      message: 'ok',
      data: { records: records.map((r) => this.toDict(r)), total: records.length },
    };
  }

  async deleteRecord(userId: number, recordId: number) {
    const record = await this.prisma.analysis.findFirst({
      where: { id: recordId, user_id: userId },
    });
    if (!record) throw new NotFoundException('记录不存在');
    await this.prisma.analysis.delete({ where: { id: recordId } });
    return { code: 0, message: '已删除', data: null };
  }

  // ------------------------------------------------------------------
  // 序列化
  // ------------------------------------------------------------------

  private async loadAnalysis(id: number) {
    const analysis = await this.prisma.analysis.findUnique({
      where: { id },
      include: { dimensions: true },
    });
    return this.toDict(analysis!);
  }

  private toDict(analysis: any) {
    const dimMap: Record<string, any> = {};
    for (const d of analysis.dimensions || []) {
      dimMap[d.dimension_type] = d;
    }

    const dim = (type: string) => {
      const d = dimMap[type];
      if (!d) return { score: 0, highlights: [], warnings: [], ...EMPTY_DETAIL[type] };
      return {
        score: d.score,
        highlights: analysis.highlights || [],
        warnings: analysis.warnings || [],
        ...d.detail,
      };
    };

    return {
      id: String(analysis.id),
      url: analysis.url,
      name: analysis.name,
      platform: analysis.platform,
      image: analysis.image,
      currentPrice: analysis.current_price,
      originalPrice: analysis.original_price || analysis.current_price,
      monthlySales: analysis.monthly_sales,
      shopName: analysis.shop_name,
      category: analysis.category,
      rating: analysis.rating,
      reviews: analysis.reviews,
      analyzedAt: analysis.analyzed_at?.toISOString?.() || '',
      design: dim('design'),
      pricing: dim('pricing'),
      functionality: dim('functionality'),
      quality: dim('quality'),
      service: dim('service'),
    };
  }

  // ------------------------------------------------------------------
  // 字段提取（与 Python 版逻辑完全一致）
  // ------------------------------------------------------------------

  private raw(ctx: any) { return ctx.raw || {}; }

  private extractName(ctx: any): string {
    const r = this.raw(ctx);
    return r.title || r.name || r.item_title || r.product_name || '未知商品';
  }

  private extractPrice(ctx: any): number {
    const r = this.raw(ctx);
    for (const key of ['DiscountPrice', 'itemPrice']) {
      const v = r[key];
      if (v != null) {
        const p = parseFloat(v);
        if (!isNaN(p)) return p > 1000 ? p / 100 : p;
      }
    }
    for (const key of ['price', 'current_price', 'sale_price']) {
      const v = r[key];
      if (v != null) {
        const p = parseFloat(v);
        if (!isNaN(p)) return p;
      }
    }
    return 0;
  }

  private extractOriginalPrice(ctx: any): number {
    const r = this.raw(ctx);
    if (r.itemPrice != null) {
      const p = parseFloat(r.itemPrice);
      if (!isNaN(p)) return p > 1000 ? p / 100 : p;
    }
    return this.extractPrice(ctx);
  }

  private extractSales(ctx: any): number {
    const r = this.raw(ctx);
    for (const key of ['sales', 'monthly_sales', 'sale_count', 'sold', 'orderPayUV']) {
      const v = r[key];
      if (v != null) {
        if (typeof v === 'string') {
          if (v.includes('万+')) return Math.floor(parseFloat(v.replace('万+', '')) * 10000);
          if (v.includes('万')) return Math.floor(parseFloat(v.replace('万', '')) * 10000);
        }
        const n = parseInt(v);
        if (!isNaN(n)) return n;
      }
    }
    return 0;
  }

  private extractShopName(ctx: any): string {
    const r = this.raw(ctx);
    const shop = r.shop || r.seller || r.shopName || '';
    if (typeof shop === 'object') return shop.name || shop.shop_name || '';
    return String(shop);
  }

  private extractCategory(ctx: any): string {
    const r = this.raw(ctx);
    const cat = r.category || r.categories || r.categoryId || '';
    if (Array.isArray(cat)) return cat.join(' > ');
    return String(cat);
  }

  private extractRating(ctx: any): number {
    const r = this.raw(ctx);
    if (r.sellerGoodrat != null) {
      const v = parseFloat(r.sellerGoodrat);
      if (!isNaN(v)) return Math.round(v / 2000 * 10) / 10;
    }
    for (const key of ['rating', 'score', 'avg_score']) {
      if (r[key] != null) {
        const v = parseFloat(r[key]);
        if (!isNaN(v)) return v > 100 ? v / 2000 : v;
      }
    }
    return 0;
  }

  private extractReviewCount(ctx: any): number {
    const c = ctx.comments || {};
    if (c.total != null) {
      const n = parseInt(c.total);
      if (!isNaN(n)) return n;
    }
    const r = this.raw(ctx);
    for (const key of ['commentCount', 'reviews', 'comment_count', 'total_comments']) {
      if (r[key] != null) {
        const n = parseInt(r[key]);
        if (!isNaN(n)) return n;
      }
    }
    return 0;
  }

  private guessIcon(ctx: any): string {
    const name = this.extractName(ctx);
    const icons: Record<string, string> = {
      '耳机': '🎧', '手机': '📱', '电脑': '💻', '笔记本': '💻',
      '显示器': '🖥️', '键盘': '⌨️', '鼠标': '🖱️',
      '手表': '⌚', '音箱': '🔊', '相机': '📷', '游戏': '🎮',
      '咖啡': '☕', '茶': '🍵', '鞋': '👟', '衣服': '👕',
      '裤子': '👖', '包': '🎒',
    };
    for (const [kw, icon] of Object.entries(icons)) {
      if (name.includes(kw)) return icon;
    }
    return '📦';
  }
}
