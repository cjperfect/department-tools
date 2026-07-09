import { apiClient } from '@/api/client'
import type { NavGroup as ApiNavGroup } from '@department-tools/types/auth'
import type { NavGroup, NavItem } from '@/components/layout/types'
import {
  LayoutDashboard,
  BarChart3,
  Eye,
  Users,
  Building2,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export type { NavGroup }

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  BarChart3,
  Eye,
  Users,
  Building2,
  Settings,
}

export function transformMenus(rawGroups: ApiNavGroup[]): NavGroup[] {
  return rawGroups.map((group) => ({
    title: group.title,
    items: group.items.map((item) => {
      const icon = iconMap[item.icon] || LayoutDashboard
      if (item.items?.length) {
        return {
          title: item.title,
          icon,
          items: item.items.map((sub) => ({
            title: sub.title,
            url: sub.url,
            icon: iconMap[sub.icon] || LayoutDashboard,
          })),
        } satisfies NavItem
      }
      return {
        title: item.title,
        url: item.url,
        icon,
      } satisfies NavItem
    }),
  }))
}

export async function fetchMenus(): Promise<ApiNavGroup[]> {
  const { data } = await apiClient.get<{ navGroups: ApiNavGroup[] }>('/api/auth/menu')
  return data.navGroups
}
