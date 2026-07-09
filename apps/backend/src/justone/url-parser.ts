/** URL 解析器 — 从商品链接提取平台和商品 ID。移植自 Python 版 url_parser.py。 */

export const PLATFORM_JD = '京东';
export const PLATFORM_TMALL = '天猫';
export const PLATFORM_TAOBAO = '淘宝';
export const PLATFORM_PINDUODUO = '拼多多';

export const UNSUPPORTED_PLATFORMS = new Set([PLATFORM_PINDUODUO]);

interface ParsedUrl {
  platform: string;
  productId: string;
  isSupported: boolean;
}

const RULES: Array<{ pattern: RegExp; platform: string; group: string }> = [
  { pattern: /item\.jd\.com\/(?<id>\d+)/, platform: PLATFORM_JD, group: 'id' },
  { pattern: /detail\.tmall\.com\/.*[?&]id=(?<id>\d+)/, platform: PLATFORM_TMALL, group: 'id' },
  { pattern: /item\.taobao\.com\/.*[?&]id=(?<id>\d+)/, platform: PLATFORM_TAOBAO, group: 'id' },
  { pattern: /(?:yangkeduo|pinduoduo)\.com\/.*goods_id=(?<id>\d+)/, platform: PLATFORM_PINDUODUO, group: 'id' },
  { pattern: /(?:yangkeduo|pinduoduo)\.com\/.*goods[./](?<id>\d+)/, platform: PLATFORM_PINDUODUO, group: 'id' },
];

export function parseProductUrl(url: string): ParsedUrl | null {
  const cleaned = url.trim();
  for (const rule of RULES) {
    const match = rule.pattern.exec(cleaned);
    if (match) {
      const productId = match.groups?.[rule.group] || match[1];
      return {
        platform: rule.platform,
        productId,
        isSupported: !UNSUPPORTED_PLATFORMS.has(rule.platform),
      };
    }
  }
  return null;
}
