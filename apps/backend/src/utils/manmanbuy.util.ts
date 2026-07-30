import * as crypto from 'node:crypto'

// ---------------------------------------------------------------------------
// 常量
// ---------------------------------------------------------------------------

/** 慢慢买 API 地址 */
const API_BASE = 'https://tool.manmanbuy.com'

/**
 * 固定 secret，来自 customRequest.js 第 88 行:
 *   secret: _0x365d('0x0', 'teCD')
 * 解码后为 c5c3f201a8e8fc634d37a766a0299218
 */
const SECRET = 'c5c3f201a8e8fc634d37a766a0299218'

// ---------------------------------------------------------------------------
// Token 生成
// 算法源自 customRequest.js : getNewParam （对应 Python util.py : create_form_data）
// ---------------------------------------------------------------------------

/**
 * 生成请求 token（MD5 签名）
 *
 * 算法步骤:
 *   1. 将请求参数按 key 字母序排列
 *   2. raw = SECRET
 *   3. 遍历排序后的 key：raw += encodeURIComponent(key) + encodeURIComponent(value)
 *      （跳过 null / 空字符串的 value）
 *   4. raw += SECRET
 *   5. raw 整体转大写
 *   6. token = MD5(raw).toUpperCase()
 */
function generateToken(params: Record<string, string>): string {
  const sortedKeys = Object.keys(params).sort()

  let raw = SECRET
  for (const key of sortedKeys) {
    const value = params[key]
    if (value != null && value !== '') {
      raw += encodeURIComponent(key) + encodeURIComponent(value)
    }
  }
  raw += SECRET

  const uppercased = raw.toUpperCase()

  return crypto.createHash('md5').update(uppercased).digest('hex').toUpperCase()
}

// ---------------------------------------------------------------------------
// Ticket 提取
// 算法源自 customRequest.js : getTicket
// ---------------------------------------------------------------------------

/**
 * 从慢慢买页面 HTML 中提取 ticket
 *
 * ticket 在页面的 #ticket 元素中，需要循环右移 4 位:
 *   例: "abcdefgh" → "efghabcd"
 * 用作 Authorization: BasicAuth <ticket>
 */
function extractTicket(html: string): string | null {
  // <input type="hidden" id="ticket" value="..." />
  const match = html.match(
    /<input[^>]+id=["']ticket["'][^>]+value=["']([^"']+)["']/i
  )
  let ticket = match?.[1]?.trim() || ''
  if (!ticket) return null

  // 循环右移 4 位
  if (ticket.length > 4) {
    ticket = ticket.slice(-4) + ticket.slice(0, -4)
  }

  console.log('ticket', ticket)

  return ticket
}

// ---------------------------------------------------------------------------
// 主入口
// ---------------------------------------------------------------------------

/**
 * 查询商品历史价格
 *
 * 对应流程:
 *   1. GET 商品历史页面 → 提取 #ticket
 *   2. POST API 获取价格数据（带 token + Authorization）
 *
 * @param productUrl 商品链接（如 https://item.jd.com/10429555538.html）
 * @returns 原始 API 响应数据，失败返回 null
 */
export async function queryHistoryPrice(
  productUrl: string,
  cookie: string
): Promise<Record<string, unknown>> {
  // ---- 1. 获取 ticket 和 Cookie ----
  let ticket: string | null = null

  try {
    const pageUrl = `${API_BASE}/HistoryLowest.aspx?url=${productUrl}`
    const pageResp = await fetch(pageUrl, {
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'zh-CN,zh;q=0.9',
        connection: 'keep-alive',
        host: 'tool.manmanbuy.com',
        referer: pageUrl,
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
      },
    })

    if (pageResp.ok) {
      const html = await pageResp.text()
      ticket = extractTicket(html)
    }
  } catch (error) {
    console.log('error', error)
    // ticket 获取失败，后续尝试不带 Authorization 请求
  }

  // ---- 2. 构造请求参数 ----
  const rawParams: Record<string, string> = {
    method: 'getHistoryTrend',
    key: productUrl,
    t: String(Date.now()),
  }

  const params = new URLSearchParams()
  params.append('method', rawParams.method)
  params.append('key', rawParams.key)
  params.append('t', rawParams.t)
  params.append('token', generateToken(rawParams))

  const headers: Record<string, string> = {
    accept: '*/*',
    'accept-language': 'zh-CN,zh;q=0.9',
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    cookie,
    Referer:
      'https://tool.manmanbuy.com/HistoryLowest.aspx?url=https%3A%2F%2Fdetail.tmall.com%2Fitem.htm%3Fali_refid%3Da3_430582_1006%253A1106252971%253AN%253AnaZrqEpqcy%252FMZZswrgM6CKf18wwq%252BFvJ%253Ad97b1416d71ff46d608935d0814767d5%26ali_trackid%3D199_d97b1416d71ff46d608935d0814767d5%26id%3D742303377338%26mi_id%3D00001IU0Mp7oSzA3rbpQsCSB9OFmmUW3WnIXiFHHztm_yj8%26mm_sceneid%3D5_1_45506828_0%26skuId%3D6058999933907%26spm%3Da21n57.1.hoverItem.1%26utparam%3D%257B%2522aplus_abtest%2522%253A%2522fcb4706884c084bfcbcf94f90cb96606%2522%257D%26xxc%3Dad_ztc',
  }

  if (ticket) {
    headers['authorization'] = `BasicAuth ${ticket}`
  }

  try {
    const resp = await fetch(`${API_BASE}/api.ashx`, {
      method: 'POST',
      headers,
      body: params.toString(),
    })

    const res = await resp.json()
    return res.data || {}
  } catch {
    return {}
  }
}
