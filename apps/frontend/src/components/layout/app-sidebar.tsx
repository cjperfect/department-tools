import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail,
} from '@/components/ui/sidebar'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AppTitle } from './app-title'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { ThemeSwitch } from '@/components/theme-switch'
import { ChangePasswordDialog } from '@/components/change-password-dialog'
import { useAuthStore } from '@/stores/auth-store'
import { transformMenus } from '@/lib/menus-api'

export function AppSidebar() {
  const navigate = useNavigate()
  const { auth, menuData } = useAuthStore()
  const [pwdOpen, setPwdOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)

  const user = auth.user

  const navGroups = useMemo(() => {
    if (!menuData) return []
    return transformMenus(menuData)
  }, [menuData])

  const handleLogout = () => {
    setLogoutOpen(false)
    auth.reset()
    toast.success('已退出登录')
    navigate({ to: '/sign-in' })
  }

  return (
    <Sidebar collapsible='icon' variant='sidebar'>
      <SidebarHeader>
        <AppTitle />
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        {user && (
          <NavUser
            user={{
              name: user.username,
              employeeId: user.employee_id,
              department: user.department?.name ?? null,
              role: user.role,
              avatar: '',
            }}
            onChangePassword={() => setPwdOpen(true)}
            onSignOut={() => setLogoutOpen(true)}
          />
        )}
        <ThemeSwitch />
      </SidebarFooter>
      <SidebarRail />
      <ChangePasswordDialog open={pwdOpen} onOpenChange={setPwdOpen} />
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认退出</AlertDialogTitle>
            <AlertDialogDescription>确定要退出登录吗？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>确认退出</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  )
}
