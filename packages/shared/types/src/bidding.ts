// ---------------------------------------------------------------------------
// 竞品分析 — ProductAnalysis & 子维度类型
// ---------------------------------------------------------------------------

export interface AnalysisDimension {
  score: number
  highlights: string[]
  warnings: string[]
}

export interface DesignAnalysis extends AnalysisDimension {
  packaging: string
  colorOptions: string[]
  sizeOptions: string[]
  userLikes: string[]
  userHates: string[]
  gapOpportunities: string[]
}

export interface PricingAnalysis extends AnalysisDimension {
  competitorPrice: number
  ourPrice: number
  hasFreeTrial: boolean
  hasInstallment: boolean
  plans: { name: string; price: number }[]
  pricingGaps: string[]
}

export interface FunctionalityAnalysis extends AnalysisDimension {
  solves: string[]
  gaps: string[]
  painPoints: string[]
}

export interface QualityAnalysis extends AnalysisDimension {
  easeOfUse: string
  durability: string
  qualityIssues: string[]
  userFeedback: {
    positive: string[]
    negative: string[]
  }
}

export interface ServiceAnalysis extends AnalysisDimension {
  responseStyle: string
  avgResponseTime: string
  commonComplaints: string[]
  serviceLikes: string[]
}

export interface ProductAnalysis {
  id: string
  url: string
  name: string
  platform: string
  image: string
  currentPrice: number
  originalPrice: number
  monthlySales: number
  shopName: string
  category: string
  rating: number
  reviews: number
  analyzedAt: string
  design: DesignAnalysis
  pricing: PricingAnalysis
  functionality: FunctionalityAnalysis
  quality: QualityAnalysis
  service: ServiceAnalysis
}

// ---------------------------------------------------------------------------
// API 请求/响应
// ---------------------------------------------------------------------------

export interface AnalyzeRequest {
  url: string
}

/** 分析维度类型列表 */
export const DIMENSION_TYPES = [
  'design',
  'pricing',
  'functionality',
  'quality',
  'service',
] as const

export type DimensionType = (typeof DIMENSION_TYPES)[number]
