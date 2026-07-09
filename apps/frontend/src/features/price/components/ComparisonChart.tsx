import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { ComparisonItem } from '@/api/price'

const COLORS = ['#3b82f6', '#f97316', '#ef4444', '#facc15', '#22c55e']

interface ComparisonChartProps {
  data: ComparisonItem
}

export function ComparisonChart({ data }: ComparisonChartProps) {
  const minPrice = Math.min(...data.prices.map((p) => p.price))
  const chartData = data.prices.map((p) => ({
    ...p,
    isLowest: p.price === minPrice,
  }))

  return (
    <ResponsiveContainer width='100%' height={400}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
        <XAxis dataKey='platform' className='text-xs' />
        <YAxis className='text-xs' />
        <Tooltip
          formatter={(value) => [`¥${Number(value).toLocaleString()}`, '价格']}
        />
        <Bar dataKey='price' name='价格' radius={[4, 4, 0, 0]}>
          {chartData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              fillOpacity={chartData[index].isLowest ? 1 : 0.6}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
