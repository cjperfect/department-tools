import { useEffect, useRef, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/PageHeader'
import { PriceMonitorStatCards } from '../components/StatCards'
import { MonitorList } from '../components/MonitorList'
import { getMonitorList, type MonitorProduct } from '@/api/price'
import { toast } from 'sonner'

export function PriceMonitor() {
  const [products, setProducts] = useState<MonitorProduct[]>([])
  const [loading, setLoading] = useState(true)
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current) return
    loaded.current = true
    getMonitorList()
      .then(setProducts)
      .catch(() => toast.error('加载失败'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Header fixed>
        <PageHeader title='价格监控' description='监控商品价格变动' />
      </Header>
      <Main>
        <div className='space-y-4'>
          <PriceMonitorStatCards products={products} loading={loading} />
          <MonitorList
            products={products}
            setProducts={setProducts}
            loading={loading}
          />
        </div>
      </Main>
    </>
  )
}
