// ---------------------------------------------------------------------------
// 价格监控
// ---------------------------------------------------------------------------

export interface MonitorItem {
  id: number
  platform: string
  url: string
  image: string
  name: string
  shopName: string
  currentPrice: number
  targetPrice: number
  diff: number
}

export interface MonitorProduct {
  id: number
  keyword: string
  image: string
  createdAt: string
  items: MonitorItem[]
}

export interface MonitorStats {
  total: number
  monitoring: number
  triggered: number
  priceDown: number
  priceUp: number
}

export interface SearchItem {
  name: string
  price: number
  shop: string
  url: string
  image: string
  platform: string
}

export interface SearchResult {
  groups: { platform: string; items: SearchItem[] }[]
  pageSize: number
}

// ---------------------------------------------------------------------------
// API 请求
// ---------------------------------------------------------------------------

export interface MonitorItemIn {
  platform: string
  targetPrice: number
}

export interface AddMonitorRequest {
  keyword: string
  items: MonitorItemIn[]
}
