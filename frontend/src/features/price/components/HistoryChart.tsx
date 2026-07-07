import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { HistoryItem } from '@/api/price'

interface HistoryChartProps {
  items: HistoryItem[]
}

export function HistoryChart({ items }: HistoryChartProps) {
  const [selectedId, setSelectedId] = useState(String(items[0]?.id ?? ''))
  const [timeRange, setTimeRange] = useState('30')

  const selected = items.find((item) => String(item.id) === selectedId)
  if (!selected) return null

  const days = Number(timeRange)
  const chartData = selected.data.slice(-days)
  const minPrice = Math.min(...chartData.map((d) => d.price))
  const maxPrice = Math.max(...chartData.map((d) => d.price))
  const currentPrice = chartData[chartData.length - 1]?.price

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-4'>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className='w-full max-w-xs'>
            <SelectValue placeholder='选择商品' />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.id} value={String(item.id)}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Tabs value={timeRange} onValueChange={setTimeRange}>
          <TabsList>
            <TabsTrigger value='7'>7天</TabsTrigger>
            <TabsTrigger value='30'>30天</TabsTrigger>
            <TabsTrigger value='90'>90天</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <ResponsiveContainer width='100%' height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
          <XAxis
            dataKey='date'
            className='text-xs'
            interval={Math.floor(chartData.length / 8)}
          />
          <YAxis className='text-xs' domain={['auto', 'auto']} />
          <Tooltip
            formatter={(value) => [`¥${Number(value).toLocaleString()}`, '价格']}
          />
          <ReferenceLine
            y={minPrice}
            stroke='#22c55e'
            strokeDasharray='3 3'
            label={{
              value: `最低 ¥${minPrice.toFixed(0)}`,
              position: 'insideBottomRight',
              className: 'text-xs fill-green-600',
            }}
          />
          <ReferenceLine
            y={maxPrice}
            stroke='#ef4444'
            strokeDasharray='3 3'
            label={{
              value: `最高 ¥${maxPrice.toFixed(0)}`,
              position: 'insideTopRight',
              className: 'text-xs fill-red-600',
            }}
          />
          <ReferenceLine
            y={currentPrice}
            stroke='#3b82f6'
            strokeWidth={2}
            label={{
              value: `当前 ¥${currentPrice?.toFixed(0)}`,
              position: 'right',
              className: 'text-xs fill-blue-600',
            }}
          />
          <Line
            type='monotone'
            dataKey='price'
            stroke='#3b82f6'
            strokeWidth={2}
            dot={false}
            name='价格'
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
