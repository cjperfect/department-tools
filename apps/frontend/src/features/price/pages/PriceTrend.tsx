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
