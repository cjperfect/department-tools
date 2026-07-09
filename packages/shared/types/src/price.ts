// ---------------------------------------------------------------------------
// 价格监控
// ---------------------------------------------------------------------------

export interface MonitorItem {
  id: number
  platform: string
  url: string
  currentPrice: number
  targetPrice: number
  diff: number
  status: number // 0=监控中 1=已触发
  statusText: string
}

export interface MonitorProduct {
  id: number
  name: string
  image: string
  items: MonitorItem[]
}

export interface MonitorStats {
  total: number
  monitoring: number
  triggered: number
  priceDown: number
  priceUp: number
}

export interface SearchResult {
  platform: string
  items: { name: string; price: number; shop: string; url: string }[]
}

// ---------------------------------------------------------------------------
// API 请求
// ---------------------------------------------------------------------------

export interface MonitorItemIn {
  platform: string
  url: string
  targetPrice: number
}

export interface AddMonitorRequest {
  name?: string
  items: MonitorItemIn[]
}
