// 价格监控统计
export const monitorStats = {
  total: 48,
  priceDown: 12,
  priceUp: 5,
}

// 监控商品列表
export const monitorItems = [
  { id: 1, name: 'iPhone 15 Pro Max 256GB', sku: 'APL-IP15PM-256', platform: '京东', currentPrice: 8999, targetPrice: 8500, diff: -499, status: '监控中' as const },
  { id: 2, name: 'MacBook Pro 14 M3 Pro', sku: 'APL-MBP14-M3P', platform: '天猫', currentPrice: 14999, targetPrice: 14000, diff: -999, status: '监控中' as const },
  { id: 3, name: '索尼 WH-1000XM5', sku: 'SNY-WH1000XM5', platform: '拼多多', currentPrice: 1899, targetPrice: 1800, diff: -99, status: '已触发' as const },
  { id: 4, name: '戴森 V15 吸尘器', sku: 'DSN-V15', platform: '京东', currentPrice: 3990, targetPrice: 4200, diff: 210, status: '监控中' as const },
  { id: 5, name: 'Nike Air Jordan 1 Low', sku: 'NK-AJ1L', platform: '天猫', currentPrice: 899, targetPrice: 850, diff: -49, status: '监控中' as const },
  { id: 6, name: '华为 Mate 60 Pro', sku: 'HW-M60P', platform: '京东', currentPrice: 6999, targetPrice: 6500, diff: -499, status: '已触发' as const },
  { id: 7, name: 'Switch OLED 马力欧红蓝', sku: 'NTN-SWOLED', platform: '拼多多', currentPrice: 1599, targetPrice: 1500, diff: -99, status: '监控中' as const },
  { id: 8, name: 'AirPods Pro 2', sku: 'APL-APP2', platform: '天猫', currentPrice: 1699, targetPrice: 1600, diff: -99, status: '监控中' as const },
]

export type MonitorItem = typeof monitorItems[number]

// 平台列表
export const platforms = ['京东', '天猫', '拼多多', '苏宁', '抖音']

// 比价数据
export const comparisonData = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max 256GB',
    prices: [
      { platform: '京东', price: 8999 },
      { platform: '天猫', price: 9199 },
      { platform: '拼多多', price: 8499 },
      { platform: '苏宁', price: 9099 },
      { platform: '抖音', price: 8899 },
    ],
  },
  {
    id: 2,
    name: 'MacBook Pro 14 M3 Pro',
    prices: [
      { platform: '京东', price: 14999 },
      { platform: '天猫', price: 15299 },
      { platform: '拼多多', price: 13999 },
      { platform: '苏宁', price: 15199 },
      { platform: '抖音', price: 14799 },
    ],
  },
  {
    id: 3,
    name: '索尼 WH-1000XM5',
    prices: [
      { platform: '京东', price: 1899 },
      { platform: '天猫', price: 1999 },
      { platform: '拼多多', price: 1699 },
      { platform: '苏宁', price: 1949 },
      { platform: '抖音', price: 1799 },
    ],
  },
]

export type ComparisonItem = typeof comparisonData[number]

// 历史价格走势
function generateHistory(basePrice: number, days: number) {
  let price = basePrice
  return Array.from({ length: days }, (_, i) => {
    price += (Math.random() - 0.5) * basePrice * 0.03
    return {
      date: `${String(Math.floor(i / 30) + 1).padStart(2, '0')}-${String((i % 30) + 1).padStart(2, '0')}`,
      price: Math.round(price * 100) / 100,
    }
  })
}

export const historyData = [
  { id: 1, name: 'iPhone 15 Pro Max 256GB', data: generateHistory(9100, 90) },
  { id: 2, name: 'MacBook Pro 14 M3 Pro', data: generateHistory(15000, 90) },
  { id: 3, name: '索尼 WH-1000XM5', data: generateHistory(1900, 90) },
]

export type HistoryItem = typeof historyData[number]

// URL → 商品信息映射，添加监控时自动解析
export const productUrlMap: Record<string, { name: string; sku: string; platform: string; currentPrice: number }> = {
  'https://item.jd.com/100012345678.html': { name: '索尼 WH-1000XM5 无线降噪头戴式耳机', sku: 'SNY-WH1000XM5', platform: '京东', currentPrice: 1899 },
  'https://item.jd.com/100098765432.html': { name: '戴森 V15 Detect 无绳吸尘器', sku: 'DSN-V15', platform: '京东', currentPrice: 3990 },
  'https://detail.tmall.com/item.htm?id=67890123456': { name: 'Apple MacBook Pro 14英寸 M3 Pro芯片', sku: 'APL-MBP14-M3P', platform: '天猫', currentPrice: 14999 },
  'https://detail.tmall.com/item.htm?id=65432109876': { name: 'Nike Air Jordan 1 Low 复古篮球鞋', sku: 'NK-AJ1L', platform: '天猫', currentPrice: 899 },
  'https://mobile.yangkeduo.com/goods.html?goods_id=1122334455': { name: '华为 Mate 60 Pro 12GB+512GB', sku: 'HW-M60P', platform: '拼多多', currentPrice: 6999 },
}
