import type { User } from '../data/schema'
import { apiClient } from '@/api/client'

export interface UserListParams {
  username?: string
  employee_id?: string
  role?: string
  page?: number
  pageSize?: number
}

export async function fetchUsers(params?: UserListParams) {
  const clean = Object.fromEntries(
    Object.entries(params || {}).filter(([, v]) => v !== '' && v !== undefined && v !== 'all')
  )
  const { data } = await apiClient.get('/api/auth/users', { params: clean })
  return data as { items: User[]; total: number; page: number; pageSize: number }
}

export async function createUser(input: Record<string, unknown>) {
  const { data } = await apiClient.post('/api/auth/users', input)
  return data as { id: number; rawPassword?: string }
}

export async function updateUser(id: number, input: Record<string, unknown>) {
  const { data } = await apiClient.put(`/api/auth/users/${id}`, input)
  return data
}

export async function deleteUser(id: number) {
  const { data } = await apiClient.delete(`/api/auth/users/${id}`)
  return data
}

export async function resetUserPassword(id: number, newPassword: string) {
  await apiClient.put(`/api/auth/users/${id}/reset-password`, { new_password: newPassword })
}
