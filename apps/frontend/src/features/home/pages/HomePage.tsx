import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import {
  BarChart3,
  Eye,
  History,
  LayoutDashboard,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'

// 菜单图标名称 → Lucide 组件映射（与 seed 数据中的 icon 字段一致）
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  BarChart3,
  Eye,
  History,
}

// 工具卡片的富文本内容，按菜单 URL 索引
const toolEnrichment: Record<
  string,
  { badge: string; desc: string; highlights: string[] }
> = {
  '/bidding': {
    badge: '竞价',
    desc: '粘贴竞品电商链接，自动解析产品详情并生成多维度竞品分析报告。',
    highlights: ['设计评估', '定价对比', '功能分析', '质量评分', '客服评价'],
  },
  '/monitor': {
    badge: '监控',
    desc: '实时监控竞品价格变动，跨平台比价，查看历史价格走势。',
    highlights: ['价格监控', '平台比价', '走势追踪'],
  },
  '/history-price': {
    badge: '历史',
    desc: '查询商品历史价格，分析价格波动趋势，获取最低价信息。',
    highlights: ['历史价格', '价格趋势', '最低价查询'],
  },
}

export function HomePage() {
  const menuData = useAuthStore((s) => s.menuData)

  // 从菜单接口数据中提取首页工具列表，过滤掉"首页"自身及带有子菜单的项
  const tools = useMemo(() => {
    if (!menuData) return []
    const mainNav = menuData.find((g) => g.title === '主要导航')
    if (!mainNav) return []
    return mainNav.items
      .filter((item) => item.title !== '首页' && !item.items?.length)
      .map((item) => {
        const enrichment = toolEnrichment[item.url] ?? {
          badge: '',
          desc: '',
          highlights: [],
        }
        return {
          title: item.title,
          path: item.url,
          icon: iconMap[item.icon] || LayoutDashboard,
          badge: enrichment.badge,
          desc: enrichment.desc,
          highlights: enrichment.highlights,
        }
      })
  }, [menuData])

  return (
    <>
      <Header fixed>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>部门业务工具</h1>
          <p className='text-muted-foreground text-sm'>公司内部工具聚合平台</p>
        </div>
      </Header>
      <Main>
        <div className='flex flex-col items-center py-8'>
          {/* Hero */}
          <div className='mb-10 max-w-xl text-center'>
            <div className='bg-primary/10 mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl'>
              <BarChart3 className='text-primary size-8' />
            </div>
            <h2 className='mb-2 text-xl font-semibold'>欢迎使用部门业务工具</h2>
            <p className='text-muted-foreground text-sm leading-relaxed'>
              提供竞品分析、价格监控等业务工具，帮助团队高效完成市场调研与竞品追踪。
              选择一个工具开始使用。
            </p>
          </div>

          {/* Tool Cards */}
          <div className='grid w-full max-w-2xl gap-4'>
            {tools.map((tool) => (
              <Link key={tool.path} to={tool.path} className='group block'>
                <Card className='transition-shadow hover:shadow-md'>
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='bg-primary/10 flex size-10 items-center justify-center rounded-lg'>
                          <tool.icon className='text-primary size-5' />
                        </div>
                        <div>
                          <CardTitle className='group-hover:text-primary text-base transition-colors'>
                            {tool.title}
                          </CardTitle>
                          <CardDescription className='mt-0.5 text-xs'>
                            {tool.desc}
                          </CardDescription>
                        </div>
                      </div>
                      {tool.badge && (
                        <Badge variant='secondary' className='text-xs'>
                          {tool.badge}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='flex flex-wrap items-center gap-2'>
                      {tool.highlights.map((h) => (
                        <Badge
                          key={h}
                          variant='outline'
                          className='text-xs font-normal'
                        >
                          {h}
                        </Badge>
                      ))}
                      <ArrowRight className='text-muted-foreground ml-auto size-4 opacity-0 transition-opacity group-hover:opacity-100' />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </Main>
    </>
  )
}
