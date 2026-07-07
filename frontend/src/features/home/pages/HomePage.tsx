import { Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Eye, ArrowRight } from 'lucide-react'

const tools = [
  {
    title: '竞品分析',
    path: '/bidding',
    icon: BarChart3,
    badge: '竞价',
    desc: '粘贴竞品电商链接，自动解析产品详情并生成多维度竞品分析报告。',
    highlights: ['设计评估', '定价对比', '功能分析', '质量评分', '客服评价'],
  },
  {
    title: '价格监控',
    path: '/price/monitor',
    icon: Eye,
    badge: '监控',
    desc: '实时监控竞品价格变动，跨平台比价，查看历史价格走势。',
    highlights: ['价格监控', '平台比价', '走势追踪'],
  },
]

export function HomePage() {
  return (
    <>
      <Header fixed>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>部门业务工具</h1>
          <p className='text-sm text-muted-foreground'>公司内部工具聚合平台</p>
        </div>
      </Header>
      <Main>
        <div className='flex flex-col items-center py-8'>
          {/* Hero */}
          <div className='text-center max-w-xl mb-10'>
            <div className='mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10'>
              <BarChart3 className='size-8 text-primary' />
            </div>
            <h2 className='text-xl font-semibold mb-2'>欢迎使用部门业务工具</h2>
            <p className='text-sm text-muted-foreground leading-relaxed'>
              提供竞品分析、价格监控等业务工具，帮助团队高效完成市场调研与竞品追踪。
              选择一个工具开始使用。
            </p>
          </div>

          {/* Tool Cards */}
          <div className='grid gap-4 w-full max-w-2xl'>
            {tools.map((tool) => (
              <Link key={tool.path} to={tool.path} className='group block'>
                <Card className='transition-shadow hover:shadow-md'>
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='flex size-10 items-center justify-center rounded-lg bg-primary/10'>
                          <tool.icon className='size-5 text-primary' />
                        </div>
                        <div>
                          <CardTitle className='text-base group-hover:text-primary transition-colors'>
                            {tool.title}
                          </CardTitle>
                          <CardDescription className='text-xs mt-0.5'>
                            {tool.desc}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant='secondary' className='text-xs'>{tool.badge}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='flex items-center gap-2 flex-wrap'>
                      {tool.highlights.map((h) => (
                        <Badge key={h} variant='outline' className='text-xs font-normal'>
                          {h}
                        </Badge>
                      ))}
                      <ArrowRight className='size-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity' />
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
