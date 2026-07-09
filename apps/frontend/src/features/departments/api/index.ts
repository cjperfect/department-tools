import { apiClient } from '@/api/client'

export interface Department {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export async function fetchDepartments(): Promise<Department[]> {
  const { data } = await apiClient.get('/api/departments')
  return data.items as Department[]
}

export async function createDepartment(name: string): Promise<Department> {
  const { data } = await apiClient.post('/api/departments', { name })
  return data as Department
}

export async function updateDepartment(id: number, name: string): Promise<Department> {
  const { data } = await apiClient.put(`/api/departments/${id}`, { name })
  return data as Department
}

export async function deleteDepartment(id: number): Promise<void> {
  await apiClient.delete(`/api/departments/${id}`)
}
