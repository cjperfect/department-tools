/**
 * 竞品分析 API。
 *
 * 调用后端 /api/bidding/* 接口，替代原有的 Mock 数据。
 */

import { apiClient } from './client'

export interface ProductAnalysis {
  id: string
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
  design: {
    score: number
    highlights: string[]
    warnings: string[]
    packaging: string
    colorOptions: string[]
    sizeOptions: string[]
    userLikes: string[]
    userHates: string[]
    gapOpportunities: string[]
  }
  pricing: {
    score: number
    highlights: string[]
    warnings: string[]
    competitorPrice: number
    ourPrice: number
    hasFreeTrial: boolean
    hasInstallment: boolean
    plans: { name: string; price: number }[]
    pricingGaps: string[]
  }
  functionality: {
    score: number
    highlights: string[]
    warnings: string[]
    solves: string[]
    gaps: string[]
    painPoints: string[]
  }
  quality: {
    score: number
    highlights: string[]
    warnings: string[]
    easeOfUse: string
    durability: string
    qualityIssues: string[]
    userFeedback: { positive: string[]; negative: string[] }
  }
  service: {
    score: number
    highlights: string[]
    warnings: string[]
    responseStyle: string
    avgResponseTime: string
    commonComplaints: string[]
    serviceLikes: string[]
  }
}

/** 分析竞品链接 */
export async function analyzeProduct(url: string): Promise<ProductAnalysis> {
  const { data } = await apiClient.post('/api/bidding/analyze', { url })
  return data as ProductAnalysis
}

/** 搜索分析记录 */
export async function searchRecords(query: string): Promise<ProductAnalysis[]> {
  const { data } = await apiClient.get('/api/bidding/records', {
    params: { q: query },
  })
  return data.records as ProductAnalysis[]
}

/** 删除分析记录 */
export async function deleteRecord(id: string): Promise<void> {
  await apiClient.delete(`/api/bidding/records/${id}`)
}
