import { Outlet } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'
import { ChangePasswordDialog } from '@/components/change-password-dialog'
import { useAuthStore } from '@/stores/auth-store'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const mustChangePassword = useAuthStore((s) => s.mustChangePassword)

  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen>
          <SkipToMain />
          <AppSidebar />
          <SidebarInset
            className={cn(
              '@container/content',
              'has-data-[layout=fixed]:h-svh',
              'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
            )}
          >
            {children ?? <Outlet />}
          </SidebarInset>
        </SidebarProvider>

        {/* 首次登录强制修改密码 */}
        <ChangePasswordDialog
          open={mustChangePassword}
          onOpenChange={() => {}}
          dismissible={false}
        />
      </LayoutProvider>
    </SearchProvider>
  )
}
