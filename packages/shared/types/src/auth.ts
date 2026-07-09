// ---------------------------------------------------------------------------
// 角色 & 状态
// ---------------------------------------------------------------------------

export type UserRole = 'super_admin' | 'admin' | 'user'

export type UserStatus = 'active' | 'inactive'

// ---------------------------------------------------------------------------
// 认证用户
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: number
  username: string
  role: UserRole
  employee_id?: string | null
  department?: { id: number; name: string } | null
}

// ---------------------------------------------------------------------------
// 登录
// ---------------------------------------------------------------------------

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: AuthUser
  mustChangePassword?: boolean
}

// ---------------------------------------------------------------------------
// 用户管理
// ---------------------------------------------------------------------------

export interface User {
  id: number
  username: string
  employee_id: string
  department_id: number | null
  department?: { id: number; name: string } | null
  status: UserStatus
  role: UserRole
  must_change_password: boolean
  created_at: string
  updated_at: string
}

export interface CreateUserRequest {
  username: string
  employee_id?: string
  department_id?: number
  password: string
  role: UserRole
  status: UserStatus
}

export interface UpdateUserRequest {
  employee_id?: string
  department_id?: number
  role?: UserRole
  status?: UserStatus
}

export interface ChangePasswordRequest {
  old_password: string
  new_password: string
}

export interface ResetPasswordRequest {
  new_password: string
}

// ---------------------------------------------------------------------------
// 菜单 / 导航
// ---------------------------------------------------------------------------

export interface MenuItem {
  title: string
  url: string
  icon: string
  items?: MenuItem[]
}

export interface NavGroup {
  title: string
  items: MenuItem[]
}
