# 部门业务工具平台 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于 shadcn-admin 模板搭建公司内部工具聚合平台，包含竞价分析和价格检测两个模块。

**Architecture:** 克隆 shadcn-admin 模板，移除 Clerk 认证和 Demo 页面，保留 Shell 布局（侧边栏+内容区），新增 5 个业务页面和共享组件，全部使用 Mock 数据。

**Tech Stack:** React 19, Vite 8, TypeScript, ShadcnUI, TailwindCSS 4, TanStack Router, Recharts, Zod 4, Zustand, pnpm

## Global Constraints

- 无需登录注册，移除所有 Clerk 相关代码
- 所有数据使用页面内 Mock，不接后端 API
- 左侧边栏菜单 + 右侧内容区布局
- 平台名称：部门业务工具
- 首期 2 个模块 5 个页面，支持后续扩展更多工具

---

## File Structure Map

```
src/
├── routes/
│   ├── __root.tsx                    # [MODIFY] 根路由，保持不变
│   ├── _authenticated/
│   │   ├── route.tsx                 # [MODIFY] 布局路由，去 auth 逻辑
│   │   ├── index.tsx                 # [MODIFY] 首页 → 重定向到 /bidding/report
│   │   ├── bidding/
│   │   │   ├── report.tsx            # [CREATE] 竞价分析-数据报表
│   │   │   └── keyword.tsx           # [CREATE] 竞价分析-关键词查询
│   │   └── price/
│   │       ├── monitor.tsx           # [CREATE] 价格检测-价格监控
│   │       ├── compare.tsx           # [CREATE] 价格检测-平台比价
│   │       └── trend.tsx             # [CREATE] 价格检测-价格走势
│   ├── (auth)/                       # [DELETE] 整个目录
│   └── clerk/                        # [DELETE] 整个目录
├── features/
│   ├── bidding/
│   │   ├── index.ts                  # [CREATE] 统一导出
│   │   ├── pages/
│   │   │   ├── BiddingReport.tsx     # [CREATE]
│   │   │   └── KeywordQuery.tsx      # [CREATE]
│   │   ├── components/
│   │   │   ├── BiddingTrendChart.tsx # [CREATE]
│   │   │   ├── BiddingStatusPie.tsx  # [CREATE]
│   │   │   ├── StatCards.tsx         # [CREATE]
│   │   │   └── KeywordTable.tsx      # [CREATE]
│   │   └── data/
│   │       └── mock.ts              # [CREATE]
│   ├── price/
│   │   ├── index.ts                  # [CREATE] 统一导出
│   │   ├── pages/
│   │   │   ├── PriceMonitor.tsx      # [CREATE]
│   │   │   ├── PlatformCompare.tsx   # [CREATE]
│   │   │   └── PriceTrend.tsx        # [CREATE]
│   │   ├── components/
│   │   │   ├── StatCards.tsx         # [CREATE]
│   │   │   ├── MonitorTable.tsx      # [CREATE]
│   │   │   ├── MonitorForm.tsx       # [CREATE]
│   │   │   ├── ComparisonChart.tsx   # [CREATE]
│   │   │   └── HistoryChart.tsx      # [CREATE]
│   │   └── data/
│   │       └── mock.ts              # [CREATE]
│   ├── dashboard/                    # [DELETE]
│   ├── tasks/                        # [DELETE]
│   ├── apps/                         # [DELETE]
│   ├── chats/                        # [DELETE]
│   ├── users/                        # [DELETE]
│   ├── settings/                     # [DELETE]
│   ├── auth/                         # [DELETE]
│   └── errors/                       # [KEEP] 错误页面保留
├── components/
│   ├── layout/
│   │   ├── data/
│   │   │   └── sidebar-data.ts      # [MODIFY] 替换为我们的导航菜单
│   │   ├── app-sidebar.tsx           # [MODIFY] 去掉 TeamSwitcher 和 NavUser
│   │   ├── app-title.tsx             # [KEEP] 用于显示平台名称
│   │   ├── authenticated-layout.tsx  # [MODIFY] 去掉 cookie 相关
│   │   ├── header.tsx                # [KEEP]
│   │   ├── main.tsx                  # [KEEP]
│   │   └── ...其他 layout 文件       # [KEEP]
│   ├── StatCard.tsx                  # [CREATE] 统计卡片组件
│   ├── ui/                           # [KEEP] ShadcnUI 组件
│   ├── profile-dropdown.tsx          # [DELETE]
│   ├── sign-out-dialog.tsx           # [DELETE]
│   ├── password-input.tsx            # [DELETE]
│   └── ...其他共享组件               # [KEEP]
├── stores/
│   └── auth-store.ts                 # [DELETE]
├── config/
│   └── fonts.ts                      # [KEEP]
├── context/                          # [KEEP] 保留 layout/theme/direction providers
├── lib/
│   └── cookies.ts                    # [MODIFY] 去掉 auth cookie
├── main.tsx                          # [MODIFY] 去掉 auth store 引用
└── assets/
    └── clerk-logo.tsx                # [DELETE]
```

---

### Task 1: 克隆模板并清理依赖

**Files:**
- Modify: `package.json`
- Delete: `src/assets/clerk-logo.tsx`
- Delete: `src/stores/auth-store.ts`

**Interfaces:**
- Consumes: nothing (project init)
- Produces: A clean project base ready for feature work

- [ ] **Step 1: 克隆 shadcn-admin 模板**

```bash
cd /Users/chenjiang/Desktop/department-tools
git clone https://github.com/satnaing/shadcn-admin.git frontend
cd frontend
pnpm install
```

- [ ] **Step 2: 移除 Clerk 依赖**

```bash
cd /Users/chenjiang/Desktop/department-tools/frontend
pnpm remove @clerk/react
```

- [ ] **Step 3: 删除 Clerk 相关文件**

```bash
rm -rf src/routes/clerk
rm -rf src/routes/\(auth\)
rm -f src/assets/clerk-logo.tsx
rm -f src/stores/auth-store.ts
```

- [ ] **Step 4: 验证项目能正常启动**

```bash
pnpm dev
```

Expected: Dev server starts, but may have import errors from deleted files (will fix in subsequent tasks).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: clone shadcn-admin, remove Clerk auth dependency"
```

---

### Task 2: 清理 main.tsx 中的认证逻辑

**Files:**
- Modify: `src/main.tsx`

**Interfaces:**
- Consumes: Clean project from Task 1
- Produces: `main.tsx` without auth store, 401 handling, or axios error redirects

- [ ] **Step 1: 修改 main.tsx — 去掉 auth store 和 401/403 redirect 逻辑**

Replace `src/main.tsx` with:

```tsx
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { AxiosError } from 'axios'
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { handleServerError } from '@/lib/handle-server-error'
import { DirectionProvider } from './context/direction-provider'
import { FontProvider } from './context/font-provider'
import { ThemeProvider } from './context/theme-provider'

// Generated Routes
import { routeTree } from './routeTree.gen'

// Styles
import './styles/index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (import.meta.env.DEV) console.log({ failureCount, error })
        if (failureCount >= 0 && import.meta.env.DEV) return false
        if (failureCount > 3 && import.meta.env.PROD) return false
        return !(
          error instanceof AxiosError &&
          [401, 403].includes(error.response?.status ?? 0)
        )
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10 * 1000,
    },
    mutations: {
      onError: (error) => {
        handleServerError(error)
        if (error instanceof AxiosError) {
          if (error.response?.status === 304) {
            toast.error('Content not modified!')
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 500) {
          toast.error('Internal Server Error!')
          if (import.meta.env.PROD) {
            router.navigate({ to: '/500' })
          }
        }
      }
    },
  }),
})

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <FontProvider>
            <DirectionProvider>
              <RouterProvider router={router} />
            </DirectionProvider>
          </FontProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}
```

- [ ] **Step 2: 验证编译通过**

```bash
cd frontend && pnpm dev
```

Expected: Dev server starts without errors (some pages may 404, that's fine).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: remove auth store and 401 redirect logic from main.tsx"
```

---

### Task 3: 替换侧边栏导航菜单

**Files:**
- Modify: `src/components/layout/data/sidebar-data.ts`
- Modify: `src/components/layout/app-sidebar.tsx`

**Interfaces:**
- Consumes: Clean project from Tasks 1-2
- Produces: Sidebar showing 部门业务工具 with bidding + price nav groups

- [ ] **Step 1: 重写 sidebar-data.ts**

Replace `src/components/layout/data/sidebar-data.ts` with:

```typescript
import {
  BarChart3,
  Search,
  Eye,
  ArrowLeftRight,
  TrendingUp,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: '部门业务',
    email: '',
    avatar: '',
  },
  teams: [
    {
      name: '部门业务工具',
      logo: BarChart3,
      plan: '内部工具平台',
    },
  ],
  navGroups: [
    {
      title: '竞价分析',
      items: [
        {
          title: '数据报表',
          url: '/bidding/report',
          icon: BarChart3,
        },
        {
          title: '关键词查询',
          url: '/bidding/keyword',
          icon: Search,
        },
      ],
    },
    {
      title: '价格检测',
      items: [
        {
          title: '价格监控',
          url: '/price/monitor',
          icon: Eye,
        },
        {
          title: '平台比价',
          url: '/price/compare',
          icon: ArrowLeftRight,
        },
        {
          title: '价格走势',
          url: '/price/trend',
          icon: TrendingUp,
        },
      ],
    },
  ],
}
```

- [ ] **Step 2: 简化 app-sidebar.tsx — 去掉 TeamSwitcher 和 NavUser**

Replace `src/components/layout/app-sidebar.tsx` with:

```tsx
import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { ThemeSwitch } from '@/components/theme-switch'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <AppTitle />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className='px-2'>
          <ThemeSwitch />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
```

- [ ] **Step 3: 修改 app-title.tsx 显示平台名称**

Read the existing file first, then modify to show "部门业务工具" as the title. Replace content with:

```tsx
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'

export function AppTitle() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
        >
          <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
            <span className='text-sm font-bold'>部</span>
          </div>
          <div className='grid flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-semibold'>部门业务工具</span>
            <span className='truncate text-xs'>内部平台</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
```

- [ ] **Step 4: 验证侧边栏显示正确**

```bash
pnpm dev
```

Expected: Sidebar shows 2 nav groups with 5 menu items total.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: replace sidebar nav with bidding and price monitoring menus"
```

---

### Task 4: 创建路由结构

**Files:**
- Create: `src/routes/_authenticated/bidding/report.tsx`
- Create: `src/routes/_authenticated/bidding/keyword.tsx`
- Create: `src/routes/_authenticated/price/monitor.tsx`
- Create: `src/routes/_authenticated/price/compare.tsx`
- Create: `src/routes/_authenticated/price/trend.tsx`
- Modify: `src/routes/_authenticated/index.tsx`
- Delete: `src/routes/_authenticated/dashboard/`, `tasks/`, `apps/`, `chats/`, `users/`, `settings/`, `help-center/`, `errors/` subdirectories

**Interfaces:**
- Consumes: Sidebar with correct URLs from Task 3
- Produces: Working routes that render placeholder pages, demo pages removed

- [ ] **Step 1: 删除 Demo 路由目录**

```bash
cd /Users/chenjiang/Desktop/department-tools/frontend
rm -rf src/routes/_authenticated/dashboard
rm -rf src/routes/_authenticated/tasks
rm -rf src/routes/_authenticated/apps
rm -rf src/routes/_authenticated/chats
rm -rf src/routes/_authenticated/users
rm -rf src/routes/_authenticated/settings
rm -rf src/routes/_authenticated/help-center
rm -rf src/routes/_authenticated/errors
```

- [ ] **Step 2: 修改 index.tsx — 重定向到 /bidding/report**

Replace `src/routes/_authenticated/index.tsx` with:

```tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/')({
  loader: () => {
    throw redirect({ to: '/bidding/report' })
  },
})
```

- [ ] **Step 3: 创建路由文件 — bidding/report.tsx**

Create `src/routes/_authenticated/bidding/report.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { BiddingReport } from '@/features/bidding'

export const Route = createFileRoute('/_authenticated/bidding/report')({
  component: BiddingReport,
})
```

- [ ] **Step 4: 创建路由文件 — bidding/keyword.tsx**

Create `src/routes/_authenticated/bidding/keyword.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { KeywordQuery } from '@/features/bidding'

export const Route = createFileRoute('/_authenticated/bidding/keyword')({
  component: KeywordQuery,
})
```

- [ ] **Step 5: 创建路由文件 — price/monitor.tsx**

Create `src/routes/_authenticated/price/monitor.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { PriceMonitor } from '@/features/price'

export const Route = createFileRoute('/_authenticated/price/monitor')({
  component: PriceMonitor,
})
```

- [ ] **Step 6: 创建路由文件 — price/compare.tsx**

Create `src/routes/_authenticated/price/compare.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { PlatformCompare } from '@/features/price'

export const Route = createFileRoute('/_authenticated/price/compare')({
  component: PlatformCompare,
})
```

- [ ] **Step 7: 创建路由文件 — price/trend.tsx**

Create `src/routes/_authenticated/price/trend.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { PriceTrend } from '@/features/price'

export const Route = createFileRoute('/_authenticated/price/trend')({
  component: PriceTrend,
})
```

- [ ] **Step 8: 创建 features 的 barrel export 文件**

Create `src/features/bidding/index.ts`:

```typescript
export { BiddingReport } from './pages/BiddingReport'
export { KeywordQuery } from './pages/KeywordQuery'
```

Create `src/features/price/index.ts`:

```typescript
export { PriceMonitor } from './pages/PriceMonitor'
export { PlatformCompare } from './pages/PlatformCompare'
export { PriceTrend } from './pages/PriceTrend'
```

- [ ] **Step 9: 验证路由工作**

```bash
pnpm dev
```

Expected: Navigating to `/bidding/report`, `/bidding/keyword`, `/price/monitor`, `/price/compare`, `/price/trend` should work (will show empty or error pages until features are implemented). `/` should redirect to `/bidding/report`.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add route structure for bidding and price modules"
```

---

### Task 5: 创建共享组件

**Files:**
- Create: `src/components/StatCard.tsx`
- Create: `src/components/ChartCard.tsx`
- Create: `src/components/PageHeader.tsx`
- Create: `src/components/StatusBadge.tsx`

**Interfaces:**
- Consumes: Clean project structure from Tasks 1-4
- Produces: `StatCard`, `ChartCard`, `PageHeader`, `StatusBadge` — reusable across all pages

- [ ] **Step 1: 创建 StatCard.tsx**

```tsx
import { type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: 'up' | 'down'
  className?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium text-muted-foreground'>
            {title}
          </span>
          <Icon className='size-4 text-muted-foreground' />
        </div>
        <div className='mt-2 text-2xl font-bold'>{value}</div>
        {description && (
          <p
            className={cn(
              'mt-1 text-xs',
              trend === 'up' && 'text-green-600 dark:text-green-400',
              trend === 'down' && 'text-red-600 dark:text-red-400',
              !trend && 'text-muted-foreground'
            )}
          >
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: 创建 ChartCard.tsx**

```tsx
import type { ReactNode } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface ChartCardProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function ChartCard({
  title,
  description,
  children,
  className,
}: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: 创建 PageHeader.tsx**

```tsx
interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className='mb-4 flex items-center justify-between'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>{title}</h1>
        {description && (
          <p className='text-sm text-muted-foreground'>{description}</p>
        )}
      </div>
      {children && <div className='flex items-center gap-2'>{children}</div>}
    </div>
  )
}
```

- [ ] **Step 4: 创建 StatusBadge.tsx**

```tsx
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'default'

const variantClasses: Record<StatusVariant, string> = {
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  default: '',
}

interface StatusBadgeProps {
  status: string
  variant?: StatusVariant
  className?: string
}

export function StatusBadge({
  status,
  variant = 'default',
  className,
}: StatusBadgeProps) {
  return (
    <Badge variant='outline' className={cn(variantClasses[variant], className)}>
      {status}
    </Badge>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add shared components StatCard, ChartCard, PageHeader, StatusBadge"
```

---

### Task 6: 实现竞价分析 — Mock 数据 + 数据报表页

**Files:**
- Create: `src/features/bidding/data/mock.ts`
- Create: `src/features/bidding/components/StatCards.tsx`
- Create: `src/features/bidding/components/BiddingTrendChart.tsx`
- Create: `src/features/bidding/components/BiddingStatusPie.tsx`
- Create: `src/features/bidding/pages/BiddingReport.tsx`

**Interfaces:**
- Consumes: `StatCard`, `ChartCard`, `PageHeader` from Task 5, `StatusBadge` from Task 5
- Produces: Working bidding report page with charts and data table

- [ ] **Step 1: 创建 mock.ts — 竞价数据**

Create `src/features/bidding/data/mock.ts`:

```typescript
// 统计概览
export const biddingStats = {
  totalBids: 2847,
  successRate: 68.5,
  avgBid: 3.82,
  activeKeywords: 156,
}

// 竞价趋势 (近30天)
export const biddingTrend = Array.from({ length: 30 }, (_, i) => ({
  date: `${i + 1}日`,
  bids: Math.floor(Math.random() * 60) + 40,
  success: Math.floor(Math.random() * 30) + 20,
}))

// 竞价状态分布
export const biddingStatusDist = [
  { name: '成功', value: 1950, fill: '#22c55e' },
  { name: '进行中', value: 600, fill: '#3b82f6' },
  { name: '失败', value: 297, fill: '#ef4444' },
]

// 近期竞价记录
export const recentBids = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  keyword: [
    '蓝牙耳机', '手机壳', '充电宝', '数据线', '无线鼠标',
    '机械键盘', '显示器', '平板支架', '智能手表', '音箱',
    '电竞椅', '台灯', '加湿器', '筋膜枪', '电动牙刷',
    '剃须刀', '吹风机', '体脂秤', '保温杯', '双肩包',
    'T恤', '运动鞋', '瑜伽垫', '防晒霜', '面膜',
  ][i],
  bid: (Math.random() * 8 + 1).toFixed(2),
  rank: Math.floor(Math.random() * 20) + 1,
  status: ['成功', '进行中', '失败'][Math.floor(Math.random() * 3)] as '成功' | '进行中' | '失败',
  time: `2026-07-${String(Math.floor(Math.random() * 3) + 1).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
}))
```

- [ ] **Step 2: 创建 StatCards.tsx — 竞价概览卡片**

```tsx
import { BarChart3, TrendingUp, DollarSign, Hash } from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import { biddingStats } from '../data/mock'

export function BiddingStatCards() {
  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      <StatCard
        title='竞价总数'
        value={biddingStats.totalBids.toLocaleString()}
        icon={BarChart3}
        description='较上月 +12.5%'
        trend='up'
      />
      <StatCard
        title='成功率'
        value={`${biddingStats.successRate}%`}
        icon={TrendingUp}
        description='较上月 +3.2%'
        trend='up'
      />
      <StatCard
        title='平均出价'
        value={`¥${biddingStats.avgBid}`}
        icon={DollarSign}
        description='较上月 -0.3'
        trend='down'
      />
      <StatCard
        title='活跃关键词'
        value={biddingStats.activeKeywords}
        icon={Hash}
        description='较上月 +8'
        trend='up'
      />
    </div>
  )
}
```

- [ ] **Step 3: 创建 BiddingTrendChart.tsx**

```tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { biddingTrend } from '../data/mock'

export function BiddingTrendChart() {
  return (
    <ResponsiveContainer width='100%' height={300}>
      <LineChart data={biddingTrend}>
        <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
        <XAxis dataKey='date' className='text-xs' />
        <YAxis className='text-xs' />
        <Tooltip />
        <Legend />
        <Line
          type='monotone'
          dataKey='bids'
          stroke='#3b82f6'
          name='竞价次数'
          strokeWidth={2}
        />
        <Line
          type='monotone'
          dataKey='success'
          stroke='#22c55e'
          name='成功次数'
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 4: 创建 BiddingStatusPie.tsx**

```tsx
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { biddingStatusDist } from '../data/mock'

export function BiddingStatusPie() {
  return (
    <ResponsiveContainer width='100%' height={300}>
      <PieChart>
        <Pie
          data={biddingStatusDist}
          cx='50%'
          cy='50%'
          innerRadius={60}
          outerRadius={100}
          paddingAngle={4}
          dataKey='value'
          nameKey='name'
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
        >
          {biddingStatusDist.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 5: 创建 BiddingReport.tsx — 完整报表页**

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ChartCard } from '@/components/ChartCard'
import { PageHeader } from '@/components/PageHeader'
import { StatusBadge } from '@/components/StatusBadge'
import { BiddingStatCards } from '../components/StatCards'
import { BiddingTrendChart } from '../components/BiddingTrendChart'
import { BiddingStatusPie } from '../components/BiddingStatusPie'
import { recentBids } from '../data/mock'

export function BiddingReport() {
  const statusVariant = (status: string) => {
    switch (status) {
      case '成功': return 'success' as const
      case '进行中': return 'info' as const
      case '失败': return 'danger' as const
      default: return 'default' as const
    }
  }

  return (
    <>
      <Header fixed>
        <PageHeader title='数据报表' description='竞价数据概览与分析' />
      </Header>
      <Main>
        <div className='space-y-4'>
          <BiddingStatCards />
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
            <ChartCard title='竞价趋势' description='近30天竞价与成功次数变化' className='lg:col-span-4'>
              <BiddingTrendChart />
            </ChartCard>
            <ChartCard title='状态分布' description='竞价结果分布情况' className='lg:col-span-3'>
              <BiddingStatusPie />
            </ChartCard>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>近期竞价记录</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>关键词</TableHead>
                    <TableHead>出价 (元)</TableHead>
                    <TableHead>排名</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBids.slice(0, 10).map((bid) => (
                    <TableRow key={bid.id}>
                      <TableCell className='font-medium'>{bid.keyword}</TableCell>
                      <TableCell>¥{bid.bid}</TableCell>
                      <TableCell>第 {bid.rank} 名</TableCell>
                      <TableCell>
                        <StatusBadge status={bid.status} variant={statusVariant(bid.status)} />
                      </TableCell>
                      <TableCell className='text-muted-foreground'>{bid.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
```

- [ ] **Step 6: 验证页面渲染**

访问 `http://localhost:5173/bidding/report`，确认：统计卡片、折线图、饼图、数据表格全部正常显示。

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: implement bidding report page with charts and data table"
```

---

### Task 7: 实现竞价分析 — 关键词查询页

**Files:**
- Create: `src/features/bidding/components/KeywordTable.tsx`
- Create: `src/features/bidding/pages/KeywordQuery.tsx`

**Interfaces:**
- Consumes: `PageHeader`, `StatusBadge` from Task 5, mock data from Task 6
- Produces: Working keyword search page

- [ ] **Step 1: 扩展 mock.ts — 添加关键词查询数据**

Append to `src/features/bidding/data/mock.ts`:

```typescript
// 关键词查询数据
export const keywordData = [
  { keyword: '蓝牙耳机', searchVolume: 125000, competition: '高' as const, suggestedBid: 5.8, currentRank: 3 },
  { keyword: '手机壳', searchVolume: 98000, competition: '高' as const, suggestedBid: 3.2, currentRank: 8 },
  { keyword: '充电宝', searchVolume: 76000, competition: '中' as const, suggestedBid: 4.5, currentRank: 5 },
  { keyword: '数据线', searchVolume: 68000, competition: '中' as const, suggestedBid: 2.1, currentRank: 12 },
  { keyword: '无线鼠标', searchVolume: 45000, competition: '中' as const, suggestedBid: 3.8, currentRank: 6 },
  { keyword: '机械键盘', searchVolume: 52000, competition: '高' as const, suggestedBid: 8.5, currentRank: 2 },
  { keyword: '显示器', searchVolume: 38000, competition: '高' as const, suggestedBid: 7.2, currentRank: 4 },
  { keyword: '平板支架', searchVolume: 22000, competition: '低' as const, suggestedBid: 1.5, currentRank: 15 },
  { keyword: '智能手表', searchVolume: 41000, competition: '高' as const, suggestedBid: 9.2, currentRank: 1 },
  { keyword: '音箱', searchVolume: 55000, competition: '中' as const, suggestedBid: 4.0, currentRank: 7 },
  { keyword: '电竞椅', searchVolume: 18000, competition: '中' as const, suggestedBid: 12.5, currentRank: 2 },
  { keyword: '台灯', searchVolume: 28000, competition: '低' as const, suggestedBid: 2.8, currentRank: 10 },
]

export type KeywordItem = typeof keywordData[number]
```

- [ ] **Step 2: 创建 KeywordTable.tsx**

```tsx
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/StatusBadge'
import { keywordData, type KeywordItem } from '../data/mock'
import { Search } from 'lucide-react'

export function KeywordTable() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<KeywordItem[]>([])

  const handleSearch = (value: string) => {
    setQuery(value)
    if (!value.trim()) {
      setResults([])
      return
    }
    const filtered = keywordData.filter((item) =>
      item.keyword.includes(value.trim())
    )
    setResults(filtered)
  }

  const competitionVariant = (level: string) => {
    switch (level) {
      case '高': return 'danger' as const
      case '中': return 'warning' as const
      case '低': return 'success' as const
      default: return 'default' as const
    }
  }

  return (
    <div className='space-y-4'>
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          placeholder='输入关键词搜索，如"蓝牙耳机"...'
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className='pl-9'
        />
      </div>
      {results.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>关键词</TableHead>
              <TableHead>搜索量</TableHead>
              <TableHead>竞争度</TableHead>
              <TableHead>建议出价 (元)</TableHead>
              <TableHead>当前排名</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((item) => (
              <TableRow key={item.keyword}>
                <TableCell className='font-medium'>{item.keyword}</TableCell>
                <TableCell>{item.searchVolume.toLocaleString()}</TableCell>
                <TableCell>
                  <StatusBadge status={item.competition} variant={competitionVariant(item.competition)} />
                </TableCell>
                <TableCell>¥{item.suggestedBid}</TableCell>
                <TableCell>第 {item.currentRank} 名</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {query && results.length === 0 && (
        <p className='text-center text-sm text-muted-foreground py-8'>
          未找到匹配的关键词
        </p>
      )}
      {!query && (
        <p className='text-center text-sm text-muted-foreground py-8'>
          输入关键词开始查询
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: 创建 KeywordQuery.tsx — 完整查询页**

```tsx
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/PageHeader'
import { KeywordTable } from '../components/KeywordTable'

export function KeywordQuery() {
  return (
    <>
      <Header fixed>
        <PageHeader title='关键词查询' description='查询关键词的竞价排名与竞争度分析' />
      </Header>
      <Main>
        <KeywordTable />
      </Main>
    </>
  )
}
```

- [ ] **Step 4: 验证页面**

访问 `http://localhost:5173/bidding/keyword`，输入关键词验证搜索功能正常。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: implement keyword query page with search and results table"
```

---

### Task 8: 实现价格检测 — Mock 数据 + 价格监控页

**Files:**
- Create: `src/features/price/data/mock.ts`
- Create: `src/features/price/components/StatCards.tsx`
- Create: `src/features/price/components/MonitorTable.tsx`
- Create: `src/features/price/components/MonitorForm.tsx`
- Create: `src/features/price/pages/PriceMonitor.tsx`

**Interfaces:**
- Consumes: `StatCard`, `StatusBadge`, `PageHeader` from Task 5
- Produces: Working price monitor page with CRUD-like UI

- [ ] **Step 1: 创建 mock.ts — 价格监控数据**

Create `src/features/price/data/mock.ts`:

```typescript
// 价格监控统计
export const monitorStats = {
  total: 48,
  priceDown: 12,
  priceUp: 5,
}

// 监控商品列表
export const monitorItems = [
  { id: 1, name: 'iPhone 15 Pro Max 256GB', sku: 'APL-IP15PM-256', platform: '京东', currentPrice: 8999, targetPrice: 8500, diff: -499, status: '监控中' as const },
  { id: 2, name: 'MacBook Pro 14 M3 Pro', sku: 'APL-MBP14-M3P', platform: '天猫', currentPrice: 14999, targetPrice: 14000, diff: -999, status: '监控中' as const },
  { id: 3, name: '索尼 WH-1000XM5', sku: 'SNY-WH1000XM5', platform: '拼多多', currentPrice: 1899, targetPrice: 1800, diff: -99, status: '已触发' as const },
  { id: 4, name: '戴森 V15 吸尘器', sku: 'DSN-V15', platform: '京东', currentPrice: 3990, targetPrice: 4200, diff: 210, status: '监控中' as const },
  { id: 5, name: 'Nike Air Jordan 1 Low', sku: 'NK-AJ1L', platform: '天猫', currentPrice: 899, targetPrice: 850, diff: -49, status: '监控中' as const },
  { id: 6, name: '华为 Mate 60 Pro', sku: 'HW-M60P', platform: '京东', currentPrice: 6999, targetPrice: 6500, diff: -499, status: '已触发' as const },
  { id: 7, name: 'Switch OLED 马力欧红蓝', sku: 'NTN-SWOLED', platform: '拼多多', currentPrice: 1599, targetPrice: 1500, diff: -99, status: '监控中' as const },
  { id: 8, name: 'AirPods Pro 2', sku: 'APL-APP2', platform: '天猫', currentPrice: 1699, targetPrice: 1600, diff: -99, status: '监控中' as const },
]

export type MonitorItem = typeof monitorItems[number]

// 平台列表
export const platforms = ['京东', '天猫', '拼多多', '苏宁', '抖音']
```

- [ ] **Step 2: 创建 StatCards.tsx**

```tsx
import { Eye, TrendingDown, TrendingUp } from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import { monitorStats } from '../data/mock'

export function PriceMonitorStatCards() {
  return (
    <div className='grid gap-4 sm:grid-cols-3'>
      <StatCard
        title='监控总数'
        value={monitorStats.total}
        icon={Eye}
      />
      <StatCard
        title='降价商品'
        value={monitorStats.priceDown}
        icon={TrendingDown}
        description='触发降价提醒'
        trend='down'
      />
      <StatCard
        title='涨价商品'
        value={monitorStats.priceUp}
        icon={TrendingUp}
        description='较昨日 +3'
        trend='up'
      />
    </div>
  )
}
```

- [ ] **Step 3: 创建 MonitorForm.tsx — 添加监控弹窗**

```tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { platforms } from '../data/mock'

interface MonitorFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: MonitorFormData) => void
}

export interface MonitorFormData {
  name: string
  sku: string
  platform: string
  targetPrice: number
}

export function MonitorForm({ open, onOpenChange, onSubmit }: MonitorFormProps) {
  const [formData, setFormData] = useState<MonitorFormData>({
    name: '',
    sku: '',
    platform: '',
    targetPrice: 0,
  })

  const handleSubmit = () => {
    onSubmit?.(formData)
    onOpenChange(false)
    setFormData({ name: '', sku: '', platform: '', targetPrice: 0 })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加价格监控</DialogTitle>
          <DialogDescription>
            设置商品的目标价格，当价格低于目标价时将通知你
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label>商品名称</Label>
            <Input
              placeholder='请输入商品名称'
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className='space-y-2'>
            <Label>SKU</Label>
            <Input
              placeholder='请输入 SKU'
              value={formData.sku}
              onChange={(e) =>
                setFormData({ ...formData, sku: e.target.value })
              }
            />
          </div>
          <div className='space-y-2'>
            <Label>平台</Label>
            <Select
              value={formData.platform}
              onValueChange={(v) =>
                setFormData({ ...formData, platform: v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='选择平台' />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label>目标价格 (元)</Label>
            <Input
              type='number'
              placeholder='请输入目标价格'
              value={formData.targetPrice || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  targetPrice: Number(e.target.value),
                })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>确定添加</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: 创建 MonitorTable.tsx**

```tsx
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/StatusBadge'
import { monitorItems, type MonitorItem } from '../data/mock'
import { MonitorForm, type MonitorFormData } from './MonitorForm'

export function MonitorTable() {
  const [items, setItems] = useState<MonitorItem[]>(monitorItems)
  const [formOpen, setFormOpen] = useState(false)

  const handleAdd = (data: MonitorFormData) => {
    const newItem: MonitorItem = {
      id: Math.max(0, ...items.map((i) => i.id)) + 1,
      name: data.name,
      sku: data.sku,
      platform: data.platform,
      currentPrice: 0,
      targetPrice: data.targetPrice,
      diff: -data.targetPrice,
      status: '监控中',
    }
    setItems([newItem, ...items])
  }

  const handleDelete = (id: number) => {
    setItems(items.filter((i) => i.id !== id))
  }

  return (
    <>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>监控列表</CardTitle>
          <Button size='sm' onClick={() => setFormOpen(true)}>
            <Plus className='mr-1 size-4' />
            添加监控
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>商品名称</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>平台</TableHead>
                <TableHead>当前价格</TableHead>
                <TableHead>目标价格</TableHead>
                <TableHead>差价</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className='font-medium'>{item.name}</TableCell>
                  <TableCell className='font-mono text-xs'>{item.sku}</TableCell>
                  <TableCell>
                    <Badge variant='secondary'>{item.platform}</Badge>
                  </TableCell>
                  <TableCell>¥{item.currentPrice.toLocaleString()}</TableCell>
                  <TableCell>¥{item.targetPrice.toLocaleString()}</TableCell>
                  <TableCell
                    className={
                      item.diff < 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {item.diff > 0 ? '+' : ''}
                    ¥{item.diff.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={item.status}
                      variant={item.status === '已触发' ? 'success' : 'info'}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDelete(item.id)}
                    >
                      删除
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <MonitorForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleAdd}
      />
    </>
  )
}
```

- [ ] **Step 5: 创建 PriceMonitor.tsx**

```tsx
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/PageHeader'
import { PriceMonitorStatCards } from '../components/StatCards'
import { MonitorTable } from '../components/MonitorTable'

export function PriceMonitor() {
  return (
    <>
      <Header fixed>
        <PageHeader title='价格监控' description='监控商品价格变动，自动触发降价提醒' />
      </Header>
      <Main>
        <div className='space-y-4'>
          <PriceMonitorStatCards />
          <MonitorTable />
        </div>
      </Main>
    </>
  )
}
```

- [ ] **Step 6: 验证页面**

访问 `http://localhost:5173/price/monitor`，确认：统计卡片 + 监控列表 + 添加/删除功能正常。

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: implement price monitor page with add/delete and stat cards"
```

---

### Task 9: 实现价格检测 — 平台比价页

**Files:**
- Create: `src/features/price/components/ComparisonChart.tsx`
- Create: `src/features/price/pages/PlatformCompare.tsx`
- Modify: `src/features/price/data/mock.ts`

**Interfaces:**
- Consumes: `ChartCard`, `PageHeader` from Task 5
- Produces: Working cross-platform comparison page

- [ ] **Step 1: 扩展 mock.ts — 添加比价数据**

Append to `src/features/price/data/mock.ts`:

```typescript
// 比价数据
export const comparisonData = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max 256GB',
    prices: [
      { platform: '京东', price: 8999 },
      { platform: '天猫', price: 9199 },
      { platform: '拼多多', price: 8499 },
      { platform: '苏宁', price: 9099 },
      { platform: '抖音', price: 8899 },
    ],
  },
  {
    id: 2,
    name: 'MacBook Pro 14 M3 Pro',
    prices: [
      { platform: '京东', price: 14999 },
      { platform: '天猫', price: 15299 },
      { platform: '拼多多', price: 13999 },
      { platform: '苏宁', price: 15199 },
      { platform: '抖音', price: 14799 },
    ],
  },
  {
    id: 3,
    name: '索尼 WH-1000XM5',
    prices: [
      { platform: '京东', price: 1899 },
      { platform: '天猫', price: 1999 },
      { platform: '拼多多', price: 1699 },
      { platform: '苏宁', price: 1949 },
      { platform: '抖音', price: 1799 },
    ],
  },
]

export type ComparisonItem = typeof comparisonData[number]
```

- [ ] **Step 2: 创建 ComparisonChart.tsx**

```tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { ComparisonItem } from '../data/mock'

const COLORS = ['#3b82f6', '#f97316', '#ef4444', '#facc15', '#22c55e']

interface ComparisonChartProps {
  data: ComparisonItem
}

export function ComparisonChart({ data }: ComparisonChartProps) {
  const minPrice = Math.min(...data.prices.map((p) => p.price))
  const chartData = data.prices.map((p) => ({
    ...p,
    isLowest: p.price === minPrice,
  }))

  return (
    <ResponsiveContainer width='100%' height={400}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
        <XAxis dataKey='platform' className='text-xs' />
        <YAxis className='text-xs' />
        <Tooltip
          formatter={(value: number) => [`¥${value.toLocaleString()}`, '价格']}
        />
        <Bar dataKey='price' name='价格' radius={[4, 4, 0, 0]}>
          {chartData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              fillOpacity={chartData[index].isLowest ? 1 : 0.6}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 3: 创建 PlatformCompare.tsx**

```tsx
import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ChartCard } from '@/components/ChartCard'
import { PageHeader } from '@/components/PageHeader'
import { ComparisonChart } from '../components/ComparisonChart'
import { comparisonData } from '../data/mock'

export function PlatformCompare() {
  const [selectedId, setSelectedId] = useState(String(comparisonData[0].id))
  const selected = comparisonData.find(
    (item) => String(item.id) === selectedId
  )!

  return (
    <>
      <Header fixed>
        <PageHeader title='平台比价' description='同一商品跨平台价格对比分析' />
      </Header>
      <Main>
        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>选择商品</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger className='w-full max-w-md'>
                  <SelectValue placeholder='选择商品' />
                </SelectTrigger>
                <SelectContent>
                  {comparisonData.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
            <ChartCard
              title='价格对比'
              description={`${selected.name} — 各平台价格`}
              className='lg:col-span-2'
            >
              <ComparisonChart data={selected} />
            </ChartCard>
            <Card>
              <CardHeader>
                <CardTitle>价格明细</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>平台</TableHead>
                      <TableHead>价格</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected.prices.map((p) => {
                      const minPrice = Math.min(
                        ...selected.prices.map((x) => x.price)
                      )
                      const isLowest = p.price === minPrice
                      return (
                        <TableRow key={p.platform}>
                          <TableCell>{p.platform}</TableCell>
                          <TableCell
                            className={
                              isLowest
                                ? 'font-bold text-green-600'
                                : ''
                            }
                          >
                            ¥{p.price.toLocaleString()}
                            {isLowest && ' (最低)'}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
}
```

- [ ] **Step 4: 验证页面**

访问 `http://localhost:5173/price/compare`，切换商品验证柱状图和比价表联动正常。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: implement platform price comparison page with bar chart"
```

---

### Task 10: 实现价格检测 — 价格走势页

**Files:**
- Create: `src/features/price/components/HistoryChart.tsx`
- Create: `src/features/price/pages/PriceTrend.tsx`
- Modify: `src/features/price/data/mock.ts`

**Interfaces:**
- Consumes: `ChartCard`, `PageHeader` from Task 5
- Produces: Working price history trend page

- [ ] **Step 1: 扩展 mock.ts — 添加历史价格数据**

Append to `src/features/price/data/mock.ts`:

```typescript
// 历史价格走势
function generateHistory(basePrice: number, days: number) {
  let price = basePrice
  return Array.from({ length: days }, (_, i) => {
    price += (Math.random() - 0.5) * basePrice * 0.03
    return {
      date: `${String(Math.floor(i / 30) + 1).padStart(2, '0')}-${String((i % 30) + 1).padStart(2, '0')}`,
      price: Math.round(price * 100) / 100,
    }
  })
}

export const historyData = [
  { id: 1, name: 'iPhone 15 Pro Max 256GB', data: generateHistory(9100, 90) },
  { id: 2, name: 'MacBook Pro 14 M3 Pro', data: generateHistory(15000, 90) },
  { id: 3, name: '索尼 WH-1000XM5', data: generateHistory(1900, 90) },
]

export type HistoryItem = typeof historyData[number]
```

- [ ] **Step 2: 创建 HistoryChart.tsx**

```tsx
import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { HistoryItem } from '../data/mock'

interface HistoryChartProps {
  items: HistoryItem[]
}

export function HistoryChart({ items }: HistoryChartProps) {
  const [selectedId, setSelectedId] = useState(String(items[0]?.id ?? ''))
  const [timeRange, setTimeRange] = useState('30')

  const selected = items.find((item) => String(item.id) === selectedId)
  if (!selected) return null

  const days = Number(timeRange)
  const chartData = selected.data.slice(-days)
  const minPrice = Math.min(...chartData.map((d) => d.price))
  const maxPrice = Math.max(...chartData.map((d) => d.price))
  const currentPrice = chartData[chartData.length - 1]?.price

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-4'>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className='w-full max-w-xs'>
            <SelectValue placeholder='选择商品' />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.id} value={String(item.id)}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Tabs value={timeRange} onValueChange={setTimeRange}>
          <TabsList>
            <TabsTrigger value='7'>7天</TabsTrigger>
            <TabsTrigger value='30'>30天</TabsTrigger>
            <TabsTrigger value='90'>90天</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <ResponsiveContainer width='100%' height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
          <XAxis
            dataKey='date'
            className='text-xs'
            interval={Math.floor(chartData.length / 8)}
          />
          <YAxis className='text-xs' domain={['auto', 'auto']} />
          <Tooltip
            formatter={(value: number) => [`¥${value.toLocaleString()}`, '价格']}
          />
          <ReferenceLine
            y={minPrice}
            stroke='#22c55e'
            strokeDasharray='3 3'
            label={{
              value: `最低 ¥${minPrice.toFixed(0)}`,
              position: 'insideBottomRight',
              className: 'text-xs fill-green-600',
            }}
          />
          <ReferenceLine
            y={maxPrice}
            stroke='#ef4444'
            strokeDasharray='3 3'
            label={{
              value: `最高 ¥${maxPrice.toFixed(0)}`,
              position: 'insideTopRight',
              className: 'text-xs fill-red-600',
            }}
          />
          <ReferenceLine
            y={currentPrice}
            stroke='#3b82f6'
            strokeWidth={2}
            label={{
              value: `当前 ¥${currentPrice?.toFixed(0)}`,
              position: 'right',
              className: 'text-xs fill-blue-600',
            }}
          />
          <Line
            type='monotone'
            dataKey='price'
            stroke='#3b82f6'
            strokeWidth={2}
            dot={false}
            name='价格'
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

- [ ] **Step 3: 创建 PriceTrend.tsx**

```tsx
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ChartCard } from '@/components/ChartCard'
import { PageHeader } from '@/components/PageHeader'
import { HistoryChart } from '../components/HistoryChart'
import { historyData } from '../data/mock'

export function PriceTrend() {
  return (
    <>
      <Header fixed>
        <PageHeader title='价格走势' description='查看商品历史价格变化趋势' />
      </Header>
      <Main>
        <ChartCard
          title='历史价格'
          description='选择商品和时间范围查看价格走势'
        >
          <HistoryChart items={historyData} />
        </ChartCard>
      </Main>
    </>
  )
}
```

- [ ] **Step 4: 验证页面**

访问 `http://localhost:5173/price/trend`，切换商品和时间范围验证折线图和参考线显示正常。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: implement price trend page with history line chart"
```

---

### Task 11: 清理 Demo 功能文件

**Files:**
- Delete: `src/features/dashboard/`
- Delete: `src/features/tasks/`
- Delete: `src/features/apps/`
- Delete: `src/features/chats/`
- Delete: `src/features/users/`
- Delete: `src/features/settings/`
- Delete: `src/features/auth/`
- Modify: `src/components/layout/authenticated-layout.tsx`
- Delete: `src/components/profile-dropdown.tsx`
- Delete: `src/components/sign-out-dialog.tsx`

**Interfaces:**
- Consumes: All features implemented from Tasks 1-10
- Produces: A clean project without unused demo code

- [ ] **Step 1: 删除 Demo 功能目录**

```bash
cd /Users/chenjiang/Desktop/department-tools/frontend
rm -rf src/features/dashboard
rm -rf src/features/tasks
rm -rf src/features/apps
rm -rf src/features/chats
rm -rf src/features/users
rm -rf src/features/settings
rm -rf src/features/auth
```

- [ ] **Step 2: 删除认证相关组件**

```bash
rm -f src/components/profile-dropdown.tsx
rm -f src/components/sign-out-dialog.tsx
rm -f src/components/password-input.tsx
rm -f src/components/sign-out-dialog.test.tsx
rm -f src/components/password-input.test.tsx
rm -f src/components/profile-dropdown.tsx
```

- [ ] **Step 3: 简化 authenticated-layout.tsx — 去掉 cookie**

Replace `src/components/layout/authenticated-layout.tsx` with:

```tsx
import { Outlet } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
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
      </LayoutProvider>
    </SearchProvider>
  )
}
```

- [ ] **Step 4: 验证项目编译和全页面可用**

```bash
pnpm dev
```

访问所有 5 个页面验证无报错、数据正常渲染。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove demo features and auth-related components"
```

---

### Task 12: 最终验证与收尾

**Files:**
- Modify: `package.json` — 更新项目名称

**Interfaces:**
- Consumes: Complete platform from Tasks 1-11
- Produces: Final verified deployable platform

- [ ] **Step 1: 更新 package.json 项目名称**

```bash
cd /Users/chenjiang/Desktop/department-tools/frontend
# 将 "name" 字段改为 "department-tools"
```

- [ ] **Step 2: 全页面回归验证**

启动开发服务器 `pnpm dev`，逐页检查：

| 页面 | 检查点 |
|------|--------|
| `/bidding/report` | 4个统计卡片 + 折线图 + 饼图 + 表格 |
| `/bidding/keyword` | 搜索框输入"耳机"→ 显示蓝牙耳机结果 |
| `/price/monitor` | 3个统计卡片 + 监控列表 + 添加/删除 |
| `/price/compare` | 商品选择器 + 柱状图 + 价格明细表 |
| `/price/trend` | 商品选择器 + 7/30/90天切换 + 折线图 + 参考线 |
| 侧边栏 | 折叠/展开 + 主题切换 + 导航跳转 |
| `/` | 重定向到 `/bidding/report` |

- [ ] **Step 3: 修复验证中发现的问题**

- [ ] **Step 4: 最终 Commit**

```bash
git add -A
git commit -m "chore: update project name and final polish"
```
