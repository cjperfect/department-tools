import type { LoginResponse } from '@department-tools/types/auth'
import axios from 'axios'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

// 自动携带 JWT token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().auth.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 统一处理响应：解包 { code, message, data }，非 0 自动 toast
apiClient.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body && typeof body === 'object' && 'code' in body) {
      // 业务错误：自动 toast 并 reject
      if (body.code !== 0) {
        toast.error(body.message || '请求失败')
        return Promise.reject(new Error(body.message || '请求失败'))
      }
      // 成功：解包 data，保留 _msg
      const msg = body.message
      response.data = body.data ?? {}
      if (msg && typeof response.data === 'object') {
        response.data._msg = msg
      }
    }
    return response
  },
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const body = error.response.data as Record<string, unknown> | undefined
      const msg = (body && typeof body.message === 'string') ? body.message : '网络错误'
      toast.error(msg)
    } else {
      toast.error('网络错误，请稍后重试')
    }
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      useAuthStore.getState().auth.reset()
    }
    return Promise.reject(error)
  },
)

/** 登录 */
export async function loginAPI(username: string, password: string) {
  const { data } = await apiClient.post('/api/auth/login', { username, password })
  return data as LoginResponse
}
