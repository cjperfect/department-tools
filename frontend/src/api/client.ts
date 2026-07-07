/** Axios 实例 — 统一处理后端 { code, message, data } 响应格式。 */

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 响应拦截：统一解包 { code, message, data }
apiClient.interceptors.response.use(
  (response) => {
    const body = response.data
    // 如果是标准 ApiResponse 格式
    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code === 0) {
        // 成功 → 直接返回 data
        return { ...response, data: body.data }
      }
      // 业务错误 → 抛出 message
      return Promise.reject(new Error(body.message || '请求失败'))
    }
    // 非标准格式（如健康检查）原样返回
    return response
  },
  (error) => {
    if (error.response?.data) {
      const body = error.response.data
      if (body && typeof body === 'object' && 'message' in body) {
        return Promise.reject(new Error(body.message))
      }
    }
    if (error.request) {
      return Promise.reject(new Error('网络连接失败，请检查后端服务'))
    }
    return Promise.reject(error)
  },
)
