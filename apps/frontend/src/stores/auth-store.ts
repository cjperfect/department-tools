import type { AuthUser, MenuItem, NavGroup } from '@department-tools/types/auth'
import { create } from 'zustand'

const ACCESS_TOKEN = 'auth_token'
const USER_KEY = 'auth_user'
const MUST_CHANGE_PWD = 'auth_must_change_pwd'
const MENU_DATA = 'auth_menu_data'

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
  mustChangePassword: boolean
  setMustChangePassword: (v: boolean) => void
  menuData: NavGroup[] | null
  setMenuData: (data: NavGroup[] | null) => void
}

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveUser(user: AuthUser | null) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_KEY)
}

function loadMenuData(): NavGroup[] | null {
  try {
    const raw = localStorage.getItem(MENU_DATA)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveMenuData(data: NavGroup[] | null) {
  if (data) localStorage.setItem(MENU_DATA, JSON.stringify(data))
  else localStorage.removeItem(MENU_DATA)
}

export const useAuthStore = create<AuthState>()((set) => {
  const initToken = localStorage.getItem(ACCESS_TOKEN) || ''
  const initMustChange = localStorage.getItem(MUST_CHANGE_PWD) === 'true'

  return {
    auth: {
      user: loadUser(),
      setUser: (user) => {
        saveUser(user)
        set((s) => ({ ...s, auth: { ...s.auth, user } }))
      },
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((s) => {
          localStorage.setItem(ACCESS_TOKEN, accessToken)
          return { ...s, auth: { ...s.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((s) => {
          localStorage.removeItem(ACCESS_TOKEN)
          return { ...s, auth: { ...s.auth, accessToken: '' } }
        }),
      reset: () =>
        set((s) => {
          localStorage.removeItem(ACCESS_TOKEN)
          localStorage.removeItem(USER_KEY)
          localStorage.removeItem(MUST_CHANGE_PWD)
          saveMenuData(null)
          return {
            ...s,
            auth: { ...s.auth, user: null, accessToken: '' },
            mustChangePassword: false,
            menuData: null,
          }
        }),
    },
    mustChangePassword: initMustChange,
    setMustChangePassword: (v) => {
      if (v) localStorage.setItem(MUST_CHANGE_PWD, 'true')
      else localStorage.removeItem(MUST_CHANGE_PWD)
      set({ mustChangePassword: v })
    },
    menuData: loadMenuData(),
    setMenuData: (data) => {
      saveMenuData(data)
      set({ menuData: data })
    },
  }
})

export type { AuthUser, MenuItem, NavGroup }
