import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  HistoryPriceResponse,
  HistoryPriceQueryItem,
  PricePoint,
} from '@department-tools/types/history-price'
import { Loader2, Search } from 'lucide-react'
import {
  queryHistoryPrice,
  listHistoryPrice,
  refreshHistoryPrice,
  deleteHistoryPrice,
} from '@/api/history-price'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartCard } from '@/components/ChartCard'
import { ImageViewer } from '@/components/ImageViewer'
import { PageHeader } from '@/components/PageHeader'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { HistoryPriceChart } from './HistoryPriceChart'
import { QueryCard } from './QueryCard'

/** 将 datePrice 转为图表用的 PricePoint[] */
function toPricePoints(datePrice: [number, number, string][]): PricePoint[] {
  return datePrice.map(([ts, price, remark]) => ({
    date: new Date(ts).toISOString().slice(0, 10),
    price,
    remark,
  }))
}

/** 将已保存记录转为 HistoryPriceResponse 格式 */
function itemToResponse(item: HistoryPriceQueryItem): HistoryPriceResponse {
  return {
    spPic: item.image_url,
    spUrl: item.product_url,
    spName: item.product_name,
    siteName: item.platform,
    datePrice: item.price_list as [number, number, string][],
    lowerDate: item.lowest_price_date || '',
    lowerPrice: item.lowest_price,
    currentPrice: item.current_price,
    avgPrice60: 0,
  }
}

/** 商品信息卡片 */
function ProductInfo({ data }: { data: HistoryPriceResponse }) {
  const lowestPrice = Number(data.lowerPrice) || 0
  const currentPrice = Number(data.currentPrice) || 0
  const avgPrice60 = Number(data.avgPrice60) || 0

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='flex gap-4'>
          {data.spPic && (
            <ImageViewer
              src={data.spPic}
              alt={data.spName}
              className='size-24 rounded-lg'
            />
          )}
          <div className='min-w-0 flex-1 space-y-2'>
            <div className='flex items-center gap-2'>
              <Badge variant='secondary'>{data.siteName}</Badge>
              <h2 className='truncate text-lg font-semibold'>{data.spName}</h2>
            </div>
            <p className='text-muted-foreground text-sm'>
              最低价格:
              <span className='text-base font-bold text-green-600'>
                ¥{lowestPrice.toFixed(2)}
              </span>
              ({data.lowerDate.slice(0, 10)})
            </p>
            <p className='text-muted-foreground text-sm'>
              当前价格: ¥{currentPrice.toFixed(2)}
              {avgPrice60 > 0 && <> / 60天均价: ¥{avgPrice60.toFixed(2)}</>}
            </p>
            <a href={data.spUrl} target='_blank' rel='noopener noreferrer'>
              <Button variant='outline' size='sm'>
                直达链接
              </Button>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function HistoryPriceQuery() {
  const queryClient = useQueryClient()
  const [urlInput, setUrlInput] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const isValidUrl =
    urlInput.trim().startsWith('http://') ||
    urlInput.trim().startsWith('https://')

  const { data: savedList, isLoading: listLoading } = useQuery({
    queryKey: ['history-price', 'list'],
    queryFn: listHistoryPrice,
    staleTime: 30_000,
  })

  const queryMutation = useMutation({
    mutationFn: queryHistoryPrice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history-price', 'list'] })
    },
  })

  const refreshMutation = useMutation({
    mutationFn: refreshHistoryPrice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history-price', 'list'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteHistoryPrice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history-price', 'list'] })
      if (selectedId && deleteMutation.variables === selectedId) {
        setSelectedId(null)
      }
    },
  })

  const handleQuery = () => {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    queryMutation.mutate(trimmed)
  }

  const selectedData = selectedId
    ? savedList?.find((item) => item.id === selectedId)
    : null

  const displayData =
    queryMutation.data || (selectedData ? itemToResponse(selectedData) : null)

  const chartPricePoints = displayData
    ? toPricePoints(displayData.datePrice || [])
    : []

  return (
    <>
      <Header fixed>
        <PageHeader
          title='历史价格查询'
          description='输入商品链接查看历史价格走势（支持京东、天猫、淘宝、拼多多等）'
        />
      </Header>
      <Main>
        <div className='space-y-4'>
          {/* 查询输入区 */}
          <Card>
            <CardContent className='p-4'>
              <div className='flex gap-3'>
                <Input
                  placeholder='请输入商品链接，如 https://item.jd.com/10429555538.html'
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && isValidUrl && handleQuery()}
                  className='flex-1'
                />
                <Button
                  onClick={handleQuery}
                  disabled={!isValidUrl || queryMutation.isPending}
                >
                  {queryMutation.isPending ? (
                    <Loader2 className='mr-2 size-4 animate-spin' />
                  ) : (
                    <Search className='mr-2 size-4' />
                  )}
                  历史价格查询
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 查询结果区 */}
          {queryMutation.isPending && (
            <Card>
              <CardContent className='space-y-4 p-4'>
                <div className='flex gap-4'>
                  <Skeleton className='size-24 rounded-lg' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-5 w-1/2' />
                    <Skeleton className='h-4 w-1/3' />
                    <Skeleton className='h-4 w-1/4' />
                  </div>
                </div>
                <Skeleton className='h-[400px] w-full' />
              </CardContent>
            </Card>
          )}

          {displayData && !queryMutation.isPending && (
            <>
              <ProductInfo data={displayData} />
              <ChartCard
                title='价格走势'
                description='选择时间范围查看价格变化'
              >
                <HistoryPriceChart priceList={chartPricePoints} />
              </ChartCard>
            </>
          )}

          {/* 已保存列表 */}
          <div className='mt-6'>
            <h3 className='mb-3 text-lg font-semibold'>
              查询历史
              {savedList && (
                <span className='text-muted-foreground ml-2 text-sm'>
                  ({savedList.length})
                </span>
              )}
            </h3>

            {listLoading && (
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className='h-40 w-full' />
                ))}
              </div>
            )}

            {savedList && savedList.length === 0 && !listLoading && (
              <Card>
                <CardContent className='text-muted-foreground p-8 text-center'>
                  暂无查询记录，输入商品链接开始查询
                </CardContent>
              </Card>
            )}

            {savedList && savedList.length > 0 && (
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {savedList.map((item) => (
                  <QueryCard
                    key={item.id}
                    productName={item.product_name}
                    imageUrl={item.image_url}
                    platform={item.platform}
                    productUrl={item.product_url}
                    lowestPrice={item.lowest_price}
                    lowestPriceDate={item.lowest_price_date}
                    currentPrice={item.current_price}
                    updatedAt={item.updated_at}
                    isSelected={selectedId === item.id}
                    onClick={() =>
                      setSelectedId(selectedId === item.id ? null : item.id)
                    }
                    onRefresh={() => refreshMutation.mutate(item.id)}
                    onDelete={() => setDeleteId(item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Main>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null)
        }}
        title='确认删除'
        desc='删除后无法恢复，确定要删除该查询记录吗？'
        destructive
        confirmText='删除'
        cancelBtnText='取消'
        handleConfirm={() => {
          if (deleteId !== null) {
            deleteMutation.mutate(deleteId)
            setDeleteId(null)
          }
        }}
      />
    </>
  )
}
