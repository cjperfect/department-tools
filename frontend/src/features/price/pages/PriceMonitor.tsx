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
