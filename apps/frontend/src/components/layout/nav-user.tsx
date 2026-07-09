import { ChevronsUpDown, KeyRound, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'

export type NavUserProps = {
  user: {
    name: string
    employeeId?: string | null
    department?: string | null
    role: string
    avatar: string
  }
  onChangePassword: () => void
  onSignOut: () => void
}

const ROLE_LABEL: Record<string, string> = {
  super_admin: '超级管理员',
  admin: '管理员',
  user: '普通用户',
}

export function NavUser({ user, onChangePassword, onSignOut }: NavUserProps) {
  const { isMobile } = useSidebar()
  const initials = user.name.slice(0, 2).toUpperCase()
  const roleLabel = ROLE_LABEL[user.role] || user.role

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>{user.name}</span>
                <span className='truncate text-xs text-muted-foreground'>{roleLabel}</span>
              </div>
              <ChevronsUpDown className='ms-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-start text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-start text-sm leading-tight'>
                  <span className='truncate font-semibold'>{user.name}</span>
                  <span className='truncate text-xs text-muted-foreground'>{roleLabel}</span>
                </div>
              </div>
              <div className='px-1 pb-1.5 space-y-0.5'>
                {user.employeeId && (
                  <div className='flex justify-between text-xs'>
                    <span className='text-muted-foreground'>工号</span>
                    <span>{user.employeeId}</span>
                  </div>
                )}
                {user.department && (
                  <div className='flex justify-between text-xs'>
                    <span className='text-muted-foreground'>部门</span>
                    <span>{user.department}</span>
                  </div>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onChangePassword}>
              <KeyRound /> 修改密码
            </DropdownMenuItem>
            <DropdownMenuItem variant='destructive' onClick={onSignOut}>
              <LogOut /> 退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
