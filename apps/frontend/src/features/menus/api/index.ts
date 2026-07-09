import { apiClient } from '@/api/client'

export interface MenuGroup {
  id: number
  name: string
  sort_order: number
}

export interface Menu {
  id: number
  title: string
  url: string
  icon: string
  group_id: number
  sort_order: number
  roles: string[]
  group: MenuGroup
  created_at: string
  updated_at: string
}

export interface MenuListParams {
  page?: number
  pageSize?: number
  keyword?: string
}

export async function fetchMenusAPI(params?: MenuListParams): Promise<{ items: Menu[]; total: number; page: number; pageSize: number }> {
  const clean = Object.fromEntries(
    Object.entries(params || {}).filter(([, v]) => v !== '' && v !== undefined)
  )
  const { data } = await apiClient.get('/api/menus', { params: clean })
  return data as { items: Menu[]; total: number; page: number; pageSize: number }
}

export async function createMenu(input: {
  title: string; url: string; icon: string; group_id: number;
  roles?: string[]; sort_order?: number;
}): Promise<Menu> {
  const { data } = await apiClient.post('/api/menus', input)
  return data as Menu
}

export async function updateMenu(id: number, input: Partial<{
  title: string; url: string; icon: string; group_id: number;
  roles: string[]; sort_order: number;
}>): Promise<Menu> {
  const { data } = await apiClient.put(`/api/menus/${id}`, input)
  return data as Menu
}

export async function deleteMenuAPI(id: number): Promise<void> {
  await apiClient.delete(`/api/menus/${id}`)
}

// --------------- 分组 ---------------

export async function fetchGroups(): Promise<MenuGroup[]> {
  const { data } = await apiClient.get('/api/menus/groups')
  return (data as any).items as MenuGroup[]
}

export async function createGroup(name: string, sort_order?: number): Promise<MenuGroup> {
  const { data } = await apiClient.post('/api/menus/groups', { name, sort_order })
  return data as MenuGroup
}

export async function updateGroup(id: number, input: { name?: string; sort_order?: number }): Promise<MenuGroup> {
  const { data } = await apiClient.put(`/api/menus/groups/${id}`, input)
  return data as MenuGroup
}

export async function deleteGroup(id: number): Promise<void> {
  await apiClient.delete(`/api/menus/groups/${id}`)
}
