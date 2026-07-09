import { Shield, User, Crown } from 'lucide-react'
import type { UserStatus } from './schema'

export const statuses = new Map<UserStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

export const roles = [
  { label: '超级管理员', value: 'super_admin', icon: Crown },
  { label: '管理员', value: 'admin', icon: Shield },
  { label: '普通用户', value: 'user', icon: User },
] as const
