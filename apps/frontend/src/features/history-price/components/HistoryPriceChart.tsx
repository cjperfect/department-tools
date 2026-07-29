import { useState, useMemo } from 'react'
import type { PricePoint } from '@department-tools/types/history-price'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
} from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import { Line } from 'react-chartjs-2'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// 注册 Chart.js 组件
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
  annotationPlugin
)

interface HistoryPriceChartProps {
  priceList: PricePoint[]
}

export function HistoryPriceChart({ priceList }: HistoryPriceChartProps) {
  const [timeRange, setTimeRange] = useState('all')

  const chartData = useMemo(() => {
    if (!priceList.length) return []
    const days = timeRange === 'all' ? Infinity : Number(timeRange)
    return priceList.slice(-days)
  }, [priceList, timeRange])

  const minPrice = useMemo(
    () => (chartData.length ? Math.min(...chartData.map((d) => d.price)) : 0),
    [chartData]
  )
  const maxPrice = useMemo(
    () => (chartData.length ? Math.max(...chartData.map((d) => d.price)) : 0),
    [chartData]
  )
  const currentPrice = useMemo(
    () => (chartData.length ? chartData[chartData.length - 1]?.price : 0),
    [chartData]
  )

  const data = useMemo(
    () => ({
      labels: chartData.map((d) => d.date),
      datasets: [
        {
          label: '价格',
          data: chartData.map((d) => d.price),
          remarks: chartData.map((d) => d.remark || ''),
          borderColor: '#3b82f6',
          backgroundColor: (ctx: {
            chart: { ctx: CanvasRenderingContext2D }
          }) => {
            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400)
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)')
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0)')
            return gradient
          },
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#3b82f6',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
          borderWidth: 2,
        },
      ],
    }),
    [chartData]
  )

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1200,
        easing: 'easeInOutQuart' as const,
      },
      interaction: {
        intersect: false,
        mode: 'index' as const,
      },
      plugins: {
        tooltip: {
          usePointStyle: true,
          boxPadding: 4,
          callbacks: {
            label: (ctx: { parsed: { y: number | null } }) =>
              `¥${(ctx.parsed.y ?? 0).toLocaleString()}`,
            afterLabel: (ctx: any) => {
              const remark = ctx.dataset?.remarks?.[ctx.dataIndex]
              return remark || ''
            },
          },
        },
        annotation: {
          annotations: {
            ...(minPrice > 0 && {
              minLine: {
                type: 'line' as const,
                yMin: minPrice,
                yMax: minPrice,
                borderColor: '#22c55e',
                borderDash: [4, 4],
                borderWidth: 1,
                label: {
                  display: true,
                  content: `最低 ¥${minPrice.toFixed(0)}`,
                  position: 'end' as const,
                  backgroundColor: 'rgba(34, 197, 94, 0.8)',
                  color: '#fff',
                  font: { size: 12 },
                },
              },
            }),
            ...(maxPrice > 0 && {
              maxLine: {
                type: 'line' as const,
                yMin: maxPrice,
                yMax: maxPrice,
                borderColor: '#ef4444',
                borderDash: [4, 4],
                borderWidth: 1,
                label: {
                  display: true,
                  content: `最高 ¥${maxPrice.toFixed(0)}`,
                  position: 'end' as const,
                  backgroundColor: 'rgba(239, 68, 68, 0.8)',
                  color: '#fff',
                  font: { size: 12 },
                },
              },
            }),
            ...(currentPrice > 0 && {
              curLine: {
                type: 'line' as const,
                yMin: currentPrice,
                yMax: currentPrice,
                borderColor: '#3b82f6',
                borderWidth: 2,
                label: {
                  display: true,
                  content: `当前 ¥${currentPrice.toFixed(0)}`,
                  position: 'end' as const,
                  backgroundColor: 'rgba(59, 130, 246, 0.8)',
                  color: '#fff',
                  font: { size: 12 },
                },
              },
            }),
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            maxTicksLimit: 8,
            font: { size: 12 },
          },
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.06)' },
          ticks: {
            callback: (v: string | number) => `¥${Number(v).toLocaleString()}`,
            font: { size: 12 },
          },
        },
      },
    }),
    [minPrice, maxPrice, currentPrice]
  )

  if (!priceList.length) {
    return (
      <div className='text-muted-foreground flex h-[400px] items-center justify-center'>
        暂无价格数据
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <Tabs value={timeRange} onValueChange={setTimeRange}>
        <TabsList>
          <TabsTrigger value='all'>全部</TabsTrigger>
          <TabsTrigger value='180'>180天</TabsTrigger>
          <TabsTrigger value='60'>60天</TabsTrigger>
          <TabsTrigger value='30'>30天</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className='h-[400px]'>
        <Line data={data} options={options} />
      </div>
      <p className='text-muted-foreground text-center text-[14px]'>
        走势图排除了限地区、国补、异常低价、概率券以及88VIP价等特殊优惠，让走势更具参考价值
      </p>
    </div>
  )
}
