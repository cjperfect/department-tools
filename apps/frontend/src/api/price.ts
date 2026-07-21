/**
 * 价格监控 API — 对接后端 /api/price/*
 */

import type {
  MonitorItem,
  MonitorProduct,
  MonitorStats,
  SearchResult,
} from '@department-tools/types/price'
import { apiClient } from './client'

export async function getMonitorList(): Promise<MonitorProduct[]> {
  const { data } = await apiClient.get('/api/price/monitor')
  return data as MonitorProduct[]
}

export async function addMonitor(params: {
  name: string
  items: { platform: string; url: string; targetPrice: number }[]
}): Promise<MonitorProduct> {
  const { data } = await apiClient.post('/api/price/monitor', params)
  return data as MonitorProduct
}

export async function deleteProduct(productId: number): Promise<void> {
  await apiClient.delete(`/api/price/monitor/product/${productId}`)
}

export async function deleteItem(itemId: number): Promise<void> {
  await apiClient.delete(`/api/price/monitor/item/${itemId}`)
}

export async function refreshItem(itemId: number): Promise<MonitorItem> {
  const { data } = await apiClient.post(`/api/price/monitor/refresh/${itemId}`)
  return data as MonitorItem
}

export async function getMonitorStats(): Promise<MonitorStats> {
  const { data } = await apiClient.get('/api/price/stats')
  return data as MonitorStats
}

export type { MonitorItem, MonitorProduct, MonitorStats, SearchResult }

export async function searchCompare(productId: number): Promise<SearchResult> {
  const { data } = await apiClient.get(`/api/price/search/${productId}`)
  return data as SearchResult
}
