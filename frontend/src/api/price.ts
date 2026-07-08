/**
 * 价格监控 API。
 *
 * 调用后端 /api/price/* 接口，后端不可用时走离线兜底数据。
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

// ---------------------------------------------------------------------------
// 离线兜底数据
// ---------------------------------------------------------------------------

let _monitorId = 100
const FALLBACK_MONITORS: MonitorItem[] = [
  { id: _monitorId++, name: '金运A5蓝牙耳机', sku: '694593508978', platform: '淘宝', currentPrice: 94.00, targetPrice: 80.00, diff: -14.00, status: '监控中' },
  { id: _monitorId++, name: 'Apple/苹果 iPhone 17 Pro Max', sku: '975382453065', platform: '淘宝', currentPrice: 9999.00, targetPrice: 9500.00, diff: -499.00, status: '已触发' },
  { id: _monitorId++, name: '索尼 WH-1000XM6', sku: '100012345678', platform: '京东', currentPrice: 2099.00, targetPrice: 2200.00, diff: 101.00, status: '监控中' },
  { id: _monitorId++, name: '苹果 MacBook Pro 14 M3 Pro', sku: '67890123456', platform: '天猫', currentPrice: 14999.00, targetPrice: 14000.00, diff: -999.00, status: '监控中' },
  { id: _monitorId++, name: '小米 14 Ultra 骁龙8Gen3', sku: '100055566677', platform: '京东', currentPrice: 4299.00, targetPrice: 4000.00, diff: -299.00, status: '已触发' },
]

const FALLBACK_COMPARISON: Record<string, ComparisonItem> = {
  '1': { id: 1, name: '金运A5蓝牙耳机', prices: [{ platform: '淘宝', price: 94 }, { platform: '京东', price: 109 }, { platform: '拼多多', price: 79 }] },
  '2': { id: 2, name: 'iPhone 17 Pro Max', prices: [{ platform: '淘宝', price: 9999 }, { platform: '京东', price: 10299 }, { platform: '天猫', price: 10199 }] },
  '3': { id: 3, name: '索尼 WH-1000XM6', prices: [{ platform: '京东', price: 2099 }, { platform: '天猫', price: 2199 }, { platform: '拼多多', price: 1799 }] },
}

function generateHistory(basePrice: number, days: number) {
  let price = basePrice
  return Array.from({ length: days }, (_, i) => {
    price += (Math.random() - 0.5) * basePrice * 0.03
    return { date: `${String(Math.floor(i / 30) + 1).padStart(2, '0')}-${String((i % 30) + 1).padStart(2, '0')}`, price: Math.round(price * 100) / 100 }
  })
}

// ---------------------------------------------------------------------------
// 监控列表
// ---------------------------------------------------------------------------

export async function getMonitorList(): Promise<MonitorItem[]> {
  try {
    const { data } = await apiClient.get('/api/price/monitor')
    return data.records as MonitorItem[]
  } catch {
    return FALLBACK_MONITORS
  }
}

export async function addMonitor(params: {
  url: string
  targetPrice: number
}): Promise<MonitorItem> {
  try {
    const { data } = await apiClient.post('/api/price/monitor', params)
    return data as MonitorItem
  } catch {
    const item: MonitorItem = {
      id: _monitorId++,
      name: '新监控商品',
      sku: '',
      platform: '未知',
      currentPrice: 0,
      targetPrice: params.targetPrice,
      diff: -params.targetPrice,
      status: '监控中',
    }
    FALLBACK_MONITORS.unshift(item)
    return item
  }
}

export async function deleteMonitor(id: number): Promise<void> {
  try {
    await apiClient.delete(`/api/price/monitor/${id}`)
  } catch {
    const idx = FALLBACK_MONITORS.findIndex((m) => m.id === id)
    if (idx >= 0) FALLBACK_MONITORS.splice(idx, 1)
  }
}

// ---------------------------------------------------------------------------
// 统计
// ---------------------------------------------------------------------------

export async function getMonitorStats(): Promise<MonitorStats> {
  try {
    const { data } = await apiClient.get('/api/price/stats')
    return data as MonitorStats
  } catch {
    const list = FALLBACK_MONITORS
    return {
      total: list.length,
      monitoring: list.filter((m) => m.status === '监控中').length,
      triggered: list.filter((m) => m.status === '已触发').length,
      priceDown: list.filter((m) => m.diff < 0).length,
      priceUp: list.filter((m) => m.diff > 0).length,
    }
  }
}

// ---------------------------------------------------------------------------
// 比价 & 历史
// ---------------------------------------------------------------------------

export async function getCompareData(productId: string): Promise<ComparisonItem> {
  try {
    const { data } = await apiClient.get(`/api/price/compare/${productId}`)
    return data as ComparisonItem
  } catch {
    return FALLBACK_COMPARISON[productId] ?? FALLBACK_COMPARISON['1']
  }
}

export async function getHistoryData(productId: string): Promise<HistoryItem> {
  try {
    const { data } = await apiClient.get(`/api/price/history/${productId}`)
    return data as HistoryItem
  } catch {
    const prices = [94, 9999, 2099]
    const idx = (Number(productId) - 1) % prices.length
    return {
      id: Number(productId),
      name: ['金运A5蓝牙耳机', 'iPhone 17 Pro Max', '索尼 WH-1000XM6'][idx],
      data: generateHistory(prices[idx], 90),
    }
  }
}
