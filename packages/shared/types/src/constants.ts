// ---------------------------------------------------------------------------
// 平台常量
// ---------------------------------------------------------------------------

export const PLATFORM_JD = '京东'
export const PLATFORM_TMALL = '天猫'
export const PLATFORM_TAOBAO = '淘宝'
export const PLATFORM_PINDUODUO = '拼多多'

export const PLATFORMS = [
  PLATFORM_JD,
  PLATFORM_TMALL,
  PLATFORM_TAOBAO,
  PLATFORM_PINDUODUO,
] as const

export type Platform = (typeof PLATFORMS)[number]

// ---------------------------------------------------------------------------
// 角色层级
// ---------------------------------------------------------------------------

export const ROLE_HIERARCHY: Record<string, number> = {
  super_admin: 3,
  admin: 2,
  user: 1,
}

export function getRoleLevel(role: string): number {
  return ROLE_HIERARCHY[role] ?? 0
}
