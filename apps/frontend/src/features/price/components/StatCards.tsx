import { BellRing, Eye, Package } from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import type { MonitorProduct } from '@/api/price'

interface Props {
  products: MonitorProduct[]
  loading: boolean
}

export function PriceMonitorStatCards({ products, loading }: Props) {
  let totalItems = 0, triggered = 0

  for (const p of products) {
    for (const it of p.items) {
      totalItems++
      if (it.status === 1) triggered++
    }
  }

  return (
    <div className='grid gap-4 grid-cols-2 lg:grid-cols-4'>
      <StatCard title='监控产品' value={loading ? '...' : products.length} icon={Package} />
      <StatCard title='监控项数' value={loading ? '...' : totalItems} icon={Eye} />
      <StatCard title='已触发' value={loading ? '...' : triggered} icon={BellRing} trend='down' />
      <StatCard title='监控中' value={loading ? '...' : totalItems - triggered} icon={Eye} />
    </div>
  )
}
