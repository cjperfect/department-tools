import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { biddingTrend } from '../data/mock'

export function BiddingTrendChart() {
  return (
    <ResponsiveContainer width='100%' height={300}>
      <LineChart data={biddingTrend}>
        <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
        <XAxis dataKey='date' className='text-xs' />
        <YAxis className='text-xs' />
        <Tooltip />
        <Legend />
        <Line
          type='monotone'
          dataKey='bids'
          stroke='#3b82f6'
          name='竞价次数'
          strokeWidth={2}
        />
        <Line
          type='monotone'
          dataKey='success'
          stroke='#22c55e'
          name='成功次数'
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
