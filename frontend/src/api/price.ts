/**
 * 价格监控 API。
 *
 * 调用后端 /api/price/* 接口，替代原有的 Mock 数据。
 */

import { apiClient } from './client'

export interface MonitorItem {
  id: number
  name: string
  sku: string
  platform: string
  currentPrice: number
  targetPrice: number
  diff: number
  status: string
}

export interface MonitorStats {
  total: number
  monitoring: number
  triggered: number
  priceDown: number
  priceUp: number
}

export interface ComparisonItem {
  id: number
  name: string
  prices: { platform: string; price: number }[]
}

export interface HistoryItem {
  id: number
  name: string
  data: { date: string; price: number }[]
}

// -------------------------------------------------------------------
// 监控列表
// -------------------------------------------------------------------

export async function getMonitorList(): Promise<MonitorItem[]> {
  const { data } = await apiClient.get('/api/price/monitor')
  return data.records as MonitorItem[]
}

export async function addMonitor(params: {
  url: string
  targetPrice: number
}): Promise<MonitorItem> {
  const { data } = await apiClient.post('/api/price/monitor', params)
  return data as MonitorItem
}

export async function deleteMonitor(id: number): Promise<void> {
  await apiClient.delete(`/api/price/monitor/${id}`)
}

// -------------------------------------------------------------------
// 统计
// -------------------------------------------------------------------

export async function getMonitorStats(): Promise<MonitorStats> {
  const { data } = await apiClient.get('/api/price/stats')
  return data as MonitorStats
}

// -------------------------------------------------------------------
// 比价 & 历史
// -------------------------------------------------------------------

export async function getCompareData(productId: string): Promise<ComparisonItem> {
  const { data } = await apiClient.get(`/api/price/compare/${productId}`)
  return data as ComparisonItem
}

export async function getHistoryData(productId: string): Promise<HistoryItem> {
  const { data } = await apiClient.get(`/api/price/history/${productId}`)
  return data as HistoryItem
}
