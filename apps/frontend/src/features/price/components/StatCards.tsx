import { Eye, Package } from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import type { MonitorProduct } from '@/api/price'

interface Props {
  products: MonitorProduct[]
  loading: boolean
}

export function PriceMonitorStatCards({ products, loading }: Props) {
  let totalItems = 0

  for (const p of products) {
    totalItems += p.items.length
  }

  return (
    <div className='grid gap-4 grid-cols-2'>
      <StatCard title='监控产品' value={loading ? '...' : products.length} icon={Package} />
      <StatCard title='监控项数' value={loading ? '...' : totalItems} icon={Eye} />
    </div>
  )
}
