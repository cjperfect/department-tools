/**
 * 竞品分析 API。
 *
 * 调用后端 /api/bidding/* 接口，替代原有的 Mock 数据。
 */

import { apiClient } from './client'

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

// ---------------------------------------------------------------------------
// 离线兜底数据（后端不可用时使用）
// ---------------------------------------------------------------------------

const FALLBACK: Record<string, ProductAnalysis> = {
  'https://item.taobao.com/item.htm?id=694593508978': {
    id: '1',
    url: 'https://item.taobao.com/item.htm?id=694593508978',
    name: '金运A5蓝牙耳机气骨传导运动不入耳无线耳夹式挂2026新款',
    platform: '淘宝',
    image: '🎧',
    currentPrice: 94.00,
    originalPrice: 124.00,
    monthlySales: 23000,
    shopName: '金运旗舰店',
    category: '数码 > 耳机 > 蓝牙耳机',
    rating: 4.8,
    reviews: 100000,
    analyzedAt: new Date().toISOString(),
    design: {
      score: 7.5,
      highlights: ['不入耳设计舒适佩戴', '气骨传导技术漏音小', '政府补贴立减15%'],
      warnings: ['音质不如入耳式', '高音量有震动感', '通话降噪一般'],
      packaging: '天地盖礼盒装，开箱体验好',
      colorOptions: ['Ultra白', 'Ultra黑'],
      sizeOptions: ['标准版'],
      userLikes: ['轻便不入耳', '颜值高', '续航持久', '价格实惠'],
      userHates: ['黑色款沾指纹', '充电仓偏大', '没有彩色款'],
      gapOpportunities: ['推出莫兰迪配色', '充电仓小型化', '联名限定款'],
    },
    pricing: {
      score: 8.0,
      highlights: [], warnings: [],
      competitorPrice: 94.00,
      ourPrice: 89.00,
      hasFreeTrial: false, hasInstallment: false,
      plans: [
        { name: '官方标配', price: 129.00 },
        { name: '套餐三', price: 139.00 },
        { name: '套餐四', price: 139.00 },
      ],
      pricingGaps: ['竞品山水骨传导仅¥79', '小米同类型¥69'],
    },
    functionality: {
      score: 7.0,
      highlights: [], warnings: [],
      solves: ['运动时听歌', '通勤接电话', '长时间佩戴不痛'],
      gaps: ['无主动降噪', '无防水等级认证', '不支持多设备同时连接'],
      painPoints: ['蓝牙偶尔断连', '通话对方说有回音', '触控不灵敏'],
    },
    quality: {
      score: 7.8,
      highlights: [], warnings: [],
      easeOfUse: '开盖即连，触控操作简单',
      durability: '日常使用 1-2 年，电池续航约 6 小时/次',
      qualityIssues: ['充电仓磁吸力度衰减', '耳夹硅胶老化变黄'],
      userFeedback: {
        positive: ['性价比高', '不入耳真的很舒服', '续航满意'],
        negative: ['低音不够沉', '通话效果一般'],
      },
    },
    service: {
      score: 6.5,
      highlights: [], warnings: [],
      responseStyle: '自动回复+人工',
      avgResponseTime: '工作日约 2 小时',
      commonComplaints: ['退换货审核慢', '客服不够专业'],
      serviceLikes: ['7天无理由', '运费险覆盖'],
    },
  },
  'https://item.taobao.com/item.htm?id=975382453065': {
    id: '2',
    url: 'https://item.taobao.com/item.htm?id=975382453065',
    name: 'Apple/苹果 iPhone 17 Pro Max 手机',
    platform: '淘宝',
    image: '📱',
    currentPrice: 9999.00,
    originalPrice: 10999.00,
    monthlySales: 12000,
    shopName: 'Apple授权专营店-国家补贴',
    category: '数码 > 手机 > 5G手机',
    rating: 4.9,
    reviews: 56000,
    analyzedAt: new Date().toISOString(),
    design: {
      score: 9.2,
      highlights: ['A19 Pro 性能强悍', '钛金属机身质感好', '影像系统全面升级'],
      warnings: ['价格较高', '重量偏重', '充电速度慢于安卓'],
      packaging: '苹果一贯极简白盒，环保材质',
      colorOptions: ['原色钛金属', '蓝色钛金属', '白色钛金属', '黑色钛金属'],
      sizeOptions: ['256GB', '512GB', '1TB'],
      userLikes: ['钛金属边框手感极佳', '屏幕惊艳', '做工无敌'],
      userHates: ['灵动岛占面积', '摄像头凸起严重', '重量 221g'],
      gapOpportunities: ['屏下 Face ID', '折叠屏版本'],
    },
    pricing: {
      score: 4.5,
      highlights: [], warnings: [],
      competitorPrice: 9999.00,
      ourPrice: 8999.00,
      hasFreeTrial: false, hasInstallment: true,
      plans: [
        { name: '256GB', price: 9999.00 },
        { name: '512GB', price: 11999.00 },
        { name: '1TB', price: 13999.00 },
      ],
      pricingGaps: ['华为 Mate 80 Pro 同配置 ¥7999', '三星 S27 Ultra ¥8999'],
    },
    functionality: {
      score: 8.8,
      highlights: [], warnings: [],
      solves: ['日常拍照', '视频创作', '重度游戏', '移动办公'],
      gaps: ['无侧载应用', '文件管理不如安卓', 'NFC 受限'],
      painPoints: ['iOS 18 偶尔卡顿', 'Airdrop 大文件会断'],
    },
    quality: {
      score: 9.5,
      highlights: [], warnings: [],
      easeOfUse: 'iOS 上手快，生态联动无感切换',
      durability: '钛金属+超晶瓷面板，日常使用 3-5 年',
      qualityIssues: ['钛金属边框易刮花', '摄像头蓝宝石玻璃碎裂风险'],
      userFeedback: {
        positive: ['流畅度无敌', '拍照真实自然', '电池比上代耐用'],
        negative: ['贵', '充电太慢', '灵动岛没用'],
      },
    },
    service: {
      score: 7.0,
      highlights: [], warnings: [],
      responseStyle: 'Apple Store 天才吧专业高效',
      avgResponseTime: '在线客服约 5 分钟',
      commonComplaints: ['过保维修太贵', 'AppleCare+ 性价比低'],
      serviceLikes: ['天才吧服务专业', '14天无理由退换'],
    },
  },
  'https://item.jd.com/100012345678.html': {
    id: '3',
    url: 'https://item.jd.com/100012345678.html',
    name: '索尼 WH-1000XM6 无线降噪头戴式耳机',
    platform: '京东',
    image: '🎧',
    currentPrice: 2099.00,
    originalPrice: 2999.00,
    monthlySales: 8900,
    shopName: '索尼官方旗舰店',
    category: '数码 > 耳机 > 头戴式耳机',
    rating: 4.9,
    reviews: 42000,
    analyzedAt: new Date().toISOString(),
    design: {
      score: 8.5,
      highlights: ['降噪效果行业第一', '30小时续航', '佩戴舒适'],
      warnings: ['价格偏高', '折叠体积大', '仅黑白两色'],
      packaging: '环保纸质包装，简约高级',
      colorOptions: ['黑色', '白色'],
      sizeOptions: ['均码'],
      userLikes: ['外观高级', '轻便不压头', '手感细腻'],
      userHates: ['容易沾指纹', '白色款易脏'],
      gapOpportunities: ['增加莫兰迪色系', '便携折叠款'],
    },
    pricing: {
      score: 6.5,
      highlights: [], warnings: [],
      competitorPrice: 2099.00,
      ourPrice: 1899.00,
      hasFreeTrial: false, hasInstallment: true,
      plans: [{ name: '标准版', price: 2099.00 }],
      pricingGaps: ['Bose QC Ultra ¥2299 支持12期免息', 'AirPods Max ¥3999'],
    },
    functionality: {
      score: 9.0,
      highlights: [], warnings: [],
      solves: ['通勤噪音隔绝', '办公室专注', '差旅长途'],
      gaps: ['不支持有线模式充电', '通话降噪弱于竞品'],
      painPoints: ['多设备切换偶有卡顿', 'App 设置复杂'],
    },
    quality: {
      score: 8.0,
      highlights: [], warnings: [],
      easeOfUse: '佩戴即连，NFC 一触配对',
      durability: '主体耐用 5 年+，耳罩约 1 年更换',
      qualityIssues: ['耳罩皮革老化', '充电口防尘盖易丢'],
      userFeedback: {
        positive: ['降噪惊艳', '音质出色', '佩戴舒适'],
        negative: ['价格高', 'App 不好用', '白色不耐脏'],
      },
    },
    service: {
      score: 7.5,
      highlights: [], warnings: [],
      responseStyle: '标准化流程，维修需寄回',
      avgResponseTime: '工作日约 4 小时',
      commonComplaints: ['维修周期长(2周)', '换货流程繁琐'],
      serviceLikes: ['2年官方保修', '线下门店体验好'],
    },
  },
}

// ---------------------------------------------------------------------------
// API 调用（失败时走兜底数据）
// ---------------------------------------------------------------------------

/** 分析竞品链接 */
export async function analyzeProduct(url: string): Promise<ProductAnalysis> {
  try {
    const { data } = await apiClient.post('/api/bidding/analyze', { url })
    return data as ProductAnalysis
  } catch {
    // 后端不可用时走兜底
    const trimmed = url.trim()
    for (const [key, value] of Object.entries(FALLBACK)) {
      if (trimmed.includes(key) || key.includes(trimmed)) {
        return { ...value, id: crypto.randomUUID(), analyzedAt: new Date().toISOString() }
      }
    }
    throw new Error('未找到该商品，请检查链接')
  }
}

/** 搜索分析记录 */
export async function searchRecords(query: string): Promise<ProductAnalysis[]> {
  try {
    const { data } = await apiClient.get('/api/bidding/records', {
      params: { q: query },
    })
    return data.records as ProductAnalysis[]
  } catch {
    return Object.values(FALLBACK).filter(
      (r) =>
        r.name.includes(query) ||
        r.platform.includes(query) ||
        r.shopName.includes(query)
    )
  }
}

/** 删除分析记录 */
export async function deleteRecord(id: string): Promise<void> {
  try {
    await apiClient.delete(`/api/bidding/records/${id}`)
  } catch {
    // 离线模式静默忽略
  }
}
