/**
 * 历史价格查询 API — 对接后端 /api/history-price/*
 */
import type {
  HistoryPriceResponse,
  HistoryPriceQueryItem,
} from '@department-tools/types/history-price'
import { apiClient } from './client'

/** 查询历史价格并保存 */
export async function queryHistoryPrice(
  productUrl: string
): Promise<HistoryPriceResponse> {
  const { data } = await apiClient.get('/api/history-price/query', {
    params: { productUrl },
  })
  return data as HistoryPriceResponse
}

/** 获取已保存的历史价格列表 */
export async function listHistoryPrice(): Promise<HistoryPriceQueryItem[]> {
  const { data } = await apiClient.get('/api/history-price/list')
  return data as HistoryPriceQueryItem[]
}

/** 刷新单个历史价格记录 */
export async function refreshHistoryPrice(
  id: number
): Promise<HistoryPriceResponse> {
  const { data } = await apiClient.post(`/api/history-price/refresh/${id}`)
  return data as HistoryPriceResponse
}

/** 删除历史价格记录 */
export async function deleteHistoryPrice(id: number): Promise<void> {
  await apiClient.delete(`/api/history-price/${id}`)
}
