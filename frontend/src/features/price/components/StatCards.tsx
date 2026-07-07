import { useEffect, useState } from 'react'
import { Eye, TrendingDown, TrendingUp } from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import { getMonitorStats, type MonitorStats } from '@/api/price'

export function PriceMonitorStatCards() {
  const [stats, setStats] = useState<MonitorStats>({
    total: 0,
    monitoring: 0,
    triggered: 0,
    priceDown: 0,
    priceUp: 0,
  })

  useEffect(() => {
    getMonitorStats()
      .then(setStats)
      .catch(() => {
        // 静默失败，显示默认值
      })
  }, [])

  return (
    <div className='grid gap-4 sm:grid-cols-3'>
      <StatCard
        title='监控总数'
        value={stats.total}
        icon={Eye}
      />
      <StatCard
        title='降价商品'
        value={stats.priceDown}
        icon={TrendingDown}
        description='触发降价提醒'
        trend='down'
      />
      <StatCard
        title='涨价商品'
        value={stats.priceUp}
        icon={TrendingUp}
        description='较昨日 +3'
        trend='up'
      />
    </div>
  )
}
