/** 统一 API 响应信封 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T | null
}
