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
