import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ChartCard } from '@/components/ChartCard'
import { PageHeader } from '@/components/PageHeader'
import { ComparisonChart } from '../components/ComparisonChart'
import { comparisonData } from '../data/mock'

export function PlatformCompare() {
  const [selectedId, setSelectedId] = useState(String(comparisonData[0].id))
  const selected = comparisonData.find(
    (item) => String(item.id) === selectedId
  )!

  return (
    <>
      <Header fixed>
        <PageHeader title='平台比价' description='同一商品跨平台价格对比分析' />
      </Header>
      <Main>
        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>选择商品</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger className='w-full max-w-md'>
                  <SelectValue placeholder='选择商品' />
                </SelectTrigger>
                <SelectContent>
                  {comparisonData.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
            <ChartCard
              title='价格对比'
              description={`${selected.name} — 各平台价格`}
              className='lg:col-span-2'
            >
              <ComparisonChart data={selected} />
            </ChartCard>
            <Card>
              <CardHeader>
                <CardTitle>价格明细</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>平台</TableHead>
                      <TableHead>价格</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected.prices.map((p) => {
                      const minPrice = Math.min(
                        ...selected.prices.map((x) => x.price)
                      )
                      const isLowest = p.price === minPrice
                      return (
                        <TableRow key={p.platform}>
                          <TableCell>{p.platform}</TableCell>
                          <TableCell
                            className={
                              isLowest
                                ? 'font-bold text-green-600'
                                : ''
                            }
                          >
                            ¥{p.price.toLocaleString()}
                            {isLowest && ' (最低)'}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
}
