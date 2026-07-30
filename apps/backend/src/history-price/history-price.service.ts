import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { queryHistoryPrice } from '../utils/manmanbuy.util'

function parseDatePrice(raw: string): unknown[] {
  if (!raw) return []
  try {
    return JSON.parse(`[${raw}]`) as unknown[]
  } catch {
    return []
  }
}

/**
 * 提取干净字段返回给前端
 */
function pickFields(raw: Record<string, unknown>) {
  return {
    spPic: raw.spPic || '',
    spUrl: raw.spUrl || '',
    spName: raw.spName || '',
    siteName: raw.siteName || '',
    datePrice: parseDatePrice(raw.datePrice as string),
    lowerDate: raw.lowerDate || '',
    lowerPrice: raw.lowerPrice,
    currentPrice: raw.currentPrice,
    avgPrice60: raw.avgPrice60,
  }
}
@Injectable()
export class HistoryPriceService {
  private readonly logger = new Logger(HistoryPriceService.name)

  constructor(private readonly prisma: PrismaService) {}

  /** 查询并保存历史价格（直接返回慢慢买原始数据） */
  async query(
    productUrl: string,
    cookie: string | undefined,
    userId: number
  ): Promise<Record<string, unknown>> {

    const raw = await queryHistoryPrice(productUrl, cookie || '')
    if (!Object.keys(raw).length) {
      throw new Error('查询历史价格失败')
    }

    // 解析 datePrice: "[ts,price,remark],..." → 用中括号包裹后 JSON.parse
    const priceList = parseDatePrice(raw.datePrice as string)

    // 保存到数据库（同一用户同一 URL 只保留一条）
    try {
      const name = (raw.spName as string) || ''
      const pic = (raw.spPic as string) || ''
      const platform = (raw.siteName as string) || ''
      const curPrice = Number(raw.currentPrice) || 0
      const lowPrice = Number(raw.lowerPrice) || 0
      const lowDate = (raw.lowerDate as string) || null

      const existing = await this.prisma.historyPriceQuery.findFirst({
        where: { user_id: userId, product_url: productUrl },
      })

      if (existing) {
        await this.prisma.historyPriceQuery.update({
          where: { id: existing.id },
          data: {
            product_name: name,
            image_url: pic,
            platform,
            current_price: curPrice,
            lowest_price: lowPrice,
            lowest_price_date: lowDate,
            price_list: priceList as unknown as object[],
            raw_data: raw as any,
          },
        })
      } else {
        await this.prisma.historyPriceQuery.create({
          data: {
            user_id: userId,
            product_url: productUrl,
            product_name: name,
            image_url: pic,
            platform,
            current_price: curPrice,
            lowest_price: lowPrice,
            lowest_price_date: lowDate,
            price_list: priceList as unknown as object[],
            raw_data: raw as any,
          },
        })
      }
    } catch (e) {
      this.logger.error(`保存失败: ${e}`)
    }

    return pickFields(raw)
  }

  /** 获取用户已保存的历史价格列表 */
  async list(userId: number) {
    const rows = await this.prisma.historyPriceQuery.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    })

    return rows
  }

  /** 刷新单个查询（重新请求 API 并更新数据库） */
  async refresh(
    id: number,
    userId: number,
    cookie?: string,
  ): Promise<Record<string, unknown>> {
    const record = await this.prisma.historyPriceQuery.findFirst({
      where: { id, user_id: userId },
    })

    if (!record) {
      throw new Error('记录不存在')
    }

    const raw = await queryHistoryPrice(record.product_url, cookie || '')
    if (!Object.keys(raw).length) {
      throw new Error('查询历史价格失败')
    }

    const priceList = parseDatePrice(raw.datePrice as string)
    const name = (raw.spName as string) || ''
    const pic = (raw.spPic as string) || ''
    const platform = (raw.siteName as string) || ''
    const curPrice = Number(raw.currentPrice) || 0
    const lowPrice = Number(raw.lowerPrice) || 0
    const lowDate = (raw.lowerDate as string) || null

    await this.prisma.historyPriceQuery.update({
      where: { id },
      data: {
        product_name: name,
        image_url: pic,
        platform,
        current_price: curPrice,
        lowest_price: lowPrice,
        lowest_price_date: lowDate,
        price_list: priceList as unknown as object[],
        raw_data: raw as any,
      },
    })

    return pickFields(raw)
  }

  /** 删除历史价格记录 */
  async remove(id: number, userId: number): Promise<void> {
    await this.prisma.historyPriceQuery.deleteMany({
      where: { id, user_id: userId },
    })
  }
}
