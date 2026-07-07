import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/PageHeader'
import { ProductParser } from '../components/ProductParser'

export function BiddingAnalysis() {
  return (
    <>
      <Header fixed>
        <PageHeader title='竞品分析' description='粘贴竞品电商链接，多维度解析产品竞争力' />
      </Header>
      <Main>
        <ProductParser />
      </Main>
    </>
  )
}
