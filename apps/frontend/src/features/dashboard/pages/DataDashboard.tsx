import { BarChart3, TrendingUp, Eye, TrendingDown, Hash } from 'lucide-react'
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
import { StatCard } from '@/components/StatCard'
import { ChartCard } from '@/components/ChartCard'
import { StatusBadge } from '@/components/StatusBadge'
import { BiddingTrendChart } from '@/features/bidding/components/BiddingTrendChart'
import { BiddingStatusPie } from '@/features/bidding/components/BiddingStatusPie'
import { ComparisonChart } from '@/features/price/components/ComparisonChart'
import { HistoryChart } from '@/features/price/components/HistoryChart'
import { biddingStats, recentBids } from '@/features/bidding/data/mock'
import { monitorStats, monitorItems, historyData, comparisonData } from '@/features/price/data/mock'

export function DataDashboard() {
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
  })

  const triggeredItems = monitorItems.filter((i) => i.status === '已触发')
  const topBids = recentBids.slice(0, 5)

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
        <div className='flex items-center justify-between w-full'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>数据大屏</h1>
            <p className='text-sm text-muted-foreground'>{today}</p>
          </div>
        </div>
      </Header>
      <Main>
        <div className='space-y-4'>
          {/* Row 1: Combined Stats */}
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
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
              title='活跃关键词'
              value={biddingStats.activeKeywords}
              icon={Hash}
              description='较上月 +8'
              trend='up'
            />
          </div>

          {/* Row 2: Bidding Trend + Status Pie + Top Bids */}
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-5'>
            <ChartCard title='竞价趋势' description='近30天竞价与成功次数' className='lg:col-span-2'>
              <BiddingTrendChart />
            </ChartCard>
            <ChartCard title='竞价状态' description='竞价结果分布' className='lg:col-span-2'>
              <BiddingStatusPie />
            </ChartCard>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>最新竞价</CardTitle>
              </CardHeader>
              <CardContent className='p-0'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='ps-4'>关键词</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topBids.map((bid) => (
                      <TableRow key={bid.id}>
                        <TableCell className='ps-4 font-medium text-xs'>
                          {bid.keyword}
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={bid.status}
                            variant={statusVariant(bid.status)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Row 3: Price History + Platform Compare */}
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-5'>
            <ChartCard title='价格走势' description='多商品历史价格对比' className='lg:col-span-3'>
              <HistoryChart items={historyData} />
            </ChartCard>
            <ChartCard
              title='平台比价'
              description={comparisonData[0].name}
              className='lg:col-span-2'
            >
              <ComparisonChart data={comparisonData[0]} />
            </ChartCard>
          </div>

          {/* Row 4: Monitor Alerts */}
          {triggeredItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>监控预警</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>商品名称</TableHead>
                      <TableHead>平台</TableHead>
                      <TableHead>当前价格</TableHead>
                      <TableHead>目标价格</TableHead>
                      <TableHead>差价</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {triggeredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className='font-medium'>{item.name}</TableCell>
                        <TableCell>{item.platform}</TableCell>
                        <TableCell>¥{item.currentPrice.toLocaleString()}</TableCell>
                        <TableCell>¥{item.targetPrice.toLocaleString()}</TableCell>
                        <TableCell className='text-green-600'>
                          ¥{Math.abs(item.diff).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </Main>
    </>
  )
}
