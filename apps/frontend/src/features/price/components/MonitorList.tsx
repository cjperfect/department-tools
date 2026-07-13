import { useState } from 'react'
import { ExternalLink, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StatusBadge } from '@/components/StatusBadge'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { MonitorForm, type MonitorFormData } from './MonitorForm'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  addMonitor, deleteProduct, deleteItem,
  refreshItem,
  searchCompare, type SearchResult,
  type MonitorProduct,
} from '@/api/price'
import { toast } from 'sonner'

const PLATFORM_COLORS: Record<string, string> = {
  '京东': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  '淘宝': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  '天猫': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  '拼多多': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  '抖音': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
}

interface Props {
  products: MonitorProduct[]
  setProducts: React.Dispatch<React.SetStateAction<MonitorProduct[]>>
  loading: boolean
}

export function MonitorList({ products, setProducts, loading }: Props) {
  const [formOpen, setFormOpen] = useState(false)
  const [deleteInfo, setDeleteInfo] = useState<{ productId?: number; itemId?: number; label?: string } | null>(null)

  // 比价搜索
  const [searchProduct, setSearchProduct] = useState<{ id: number; name: string } | null>(null)
  const [searchSheet, setSearchSheet] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  const handleSearch = async (productId: number, productName: string) => {
    setSearchProduct({ id: productId, name: productName })
    setSearchSheet(true)
    try {
      const results = await searchCompare(productId)
      setSearchResults(results)
    } catch {
      setSearchResults([])
    }
  }

  const handleAdd = async (data: MonitorFormData) => {
    try {
      const product = await addMonitor({
        name: data.name,
        items: data.platforms
          .filter((p) => p.targetPrice > 0)
          .map((p) => ({ platform: p.platform, url: p.url, targetPrice: p.targetPrice })),
      })
      setProducts((prev) => [product, ...prev])
      toast.success(`已添加「${product.name}」`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '添加失败')
    }
  }

  const handleRefreshItem = async (itemId: number) => {
    try {
      const updated = await refreshItem(itemId)
      setProducts((prev) =>
        prev.map((p) => ({
          ...p,
          items: p.items.map((it) => (it.id === itemId ? { ...it, ...updated } : it)),
        }))
      )
      toast.success('价格已刷新')
    } catch {
      toast.error('刷新失败')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteInfo) return
    try {
      if (deleteInfo.itemId) {
        await deleteItem(deleteInfo.itemId)
        setProducts((prev) =>
          prev.map((p) => ({
            ...p,
            items: p.items.filter((it) => it.id !== deleteInfo.itemId),
          })).filter((p) => p.items.length > 0)
        )
      } else if (deleteInfo.productId) {
        await deleteProduct(deleteInfo.productId)
        setProducts((prev) => prev.filter((p) => p.id !== deleteInfo.productId))
      }
      setDeleteInfo(null)
      toast.success('已删除')
    } catch {
      toast.error('删除失败')
    }
  }

  if (loading) return <div className='py-12 text-center text-muted-foreground'>加载中...</div>

  return (
    <>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>监控列表</CardTitle>
          <Button size='sm' onClick={() => setFormOpen(true)}>
            <Plus className='mr-1 size-4' />
            添加监控
          </Button>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className='py-12 text-center text-muted-foreground'>暂无监控产品</div>
          ) : (
            <div className='grid gap-4 grid-cols-1 lg:grid-cols-2'>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onDeleteProduct={() => setDeleteInfo({ productId: product.id, label: product.name })}
                  onDeleteItem={(itemId, label) => setDeleteInfo({ itemId, label })}
                  onRefreshItem={(itemId) => handleRefreshItem(itemId)}
                  onSearch={() => handleSearch(product.id, product.name)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteInfo !== null}
        onOpenChange={(open) => { if (!open) setDeleteInfo(null) }}
        title='确认删除'
        desc={deleteInfo ? `确定要删除「${deleteInfo.label}」吗？` : ''}
        confirmText='删除'
        cancelBtnText='取消'
        destructive
        handleConfirm={handleDeleteConfirm}
      />

      <MonitorForm open={formOpen} onOpenChange={setFormOpen} onSubmit={handleAdd} />

      {/* 快速比价抽屉 */}
      <Sheet open={searchSheet} onOpenChange={setSearchSheet}>
        <SheetContent side='right' className='w-100 sm:w-120'>
          <SheetHeader>
            <SheetTitle>比价「{searchProduct?.name || ''}」</SheetTitle>
          </SheetHeader>
          <ScrollArea className='h-[calc(100vh-120px)] mt-4'>
            <div className='space-y-6 px-4'>
              {searchResults.length === 0 ? (
                <p className='text-sm text-muted-foreground text-center py-8'>搜索中...</p>
              ) : (
                searchResults.map(({ platform, items }) => {
                  const cheapest = items.reduce((a, b) => a.price < b.price ? a : b)
                  return <PlatformResults key={platform} platform={platform} results={items} cheapest={cheapest} />
                })
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}

// ====================================================================
// 比价结果
// ====================================================================

interface SearchItem {
  name: string; price: number; shop: string; url: string
}

function PlatformResults({ platform, results, cheapest }: {
  platform: string
  results: SearchItem[]
  cheapest: SearchItem
}) {
  const [expanded, setExpanded] = useState(true)
  const items = expanded ? results : [cheapest]

  return (
    <div>
      <div className='flex items-center justify-between mb-2'>
        <Badge className={`text-xs ${PLATFORM_COLORS[platform] || ''}`}>
          {platform}
        </Badge>
        {results.length > 1 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className='text-xs text-muted-foreground hover:text-foreground'
          >
            {expanded ? `收起` : `展开全部 ${results.length} 条`}
          </button>
        )}
      </div>
      <div className='space-y-2'>
        {items.map((item, idx) => (
          <div
            key={idx}
            className='flex items-center gap-3 rounded-lg border p-3 text-sm hover:bg-muted/50 transition-colors'
          >
            <div className='flex-1 min-w-0'>
              <p className='font-medium truncate'>{item.name}</p>
              <p className='text-xs text-muted-foreground'>{item.shop}</p>
            </div>
            <span className='font-mono font-bold text-red-600 shrink-0'>
              ¥{item.price}
            </span>
            <a href={item.url} target='_blank' rel='noopener noreferrer'
              className='shrink-0 text-muted-foreground hover:text-blue-600'>
              <ExternalLink className='size-4' />
            </a>
          </div>
        ))}
      </div>
      <Separator className='mt-4' />
    </div>
  )
}

// ====================================================================
// 产品卡片
// ====================================================================

function ProductCard({
  product,
  onDeleteProduct,
  onDeleteItem,
  onRefreshItem,
  onSearch,
}: {
  product: MonitorProduct
  onDeleteProduct: () => void
  onDeleteItem: (id: number, label: string) => void
  onRefreshItem: (id: number) => void
  onSearch: (id: number, name: string) => void
}) {
  const triggeredCount = product.items.filter((it) => it.status === 1).length

  return (
    <div className='rounded-lg border'>
      <div className='flex items-center justify-between px-4 py-3'>
        <div className='flex items-center gap-3'>
          <span className='text-2xl'>{product.image}</span>
          <div>
            <h3 className='font-medium text-sm'>{product.name}</h3>
            <p className='text-xs text-muted-foreground'>
              {product.items.length} 个平台
              {triggeredCount > 0 && (
                <span className='ml-2 text-red-600 font-medium'>
                  {triggeredCount} 个已触发
                </span>
              )}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-1'>
          <Button variant='outline' size='sm' onClick={onSearch} className='h-7 text-xs gap-1'>
            <Search className='size-3' strokeWidth={2.5} />
            比价
          </Button>
          <Tooltip>
          <TooltipTrigger asChild>
            <Button variant='ghost' size='icon'
              className='text-red-500 hover:bg-red-50 hover:text-red-600'
              onClick={onDeleteProduct}>
              <Trash2 className='size-4' />
            </Button>
          </TooltipTrigger>
          <TooltipContent className='font-bold'>删除产品</TooltipContent>
        </Tooltip>
      </div>
      </div>
      <Separator />
      <div className='px-4 py-2'>
        {product.items.map((item) => (
          <div key={item.id} className='flex items-center gap-3 py-2.5 border-b last:border-0 text-sm'>
            <Badge className={`shrink-0 text-xs ${PLATFORM_COLORS[item.platform] || ''}`}>
              {item.platform}
            </Badge>
            <div className='flex items-center gap-3 flex-1 min-w-0'>
              <span className='font-mono font-medium'>¥{item.currentPrice.toLocaleString()}</span>
              <span className='text-muted-foreground'>→ 目标</span>
              <span className='font-mono'>¥{item.targetPrice.toLocaleString()}</span>
              <span className={`font-mono text-xs ${item.diff <= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {item.diff > 0 ? '+' : ''}¥{Math.abs(item.diff).toLocaleString()}
              </span>
            </div>
            <StatusBadge status={item.statusText} variant={item.status === 1 ? 'success' : 'info'} />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' size='icon'
                  className='shrink-0 size-6 text-muted-foreground hover:text-blue-500'
                  onClick={() => onRefreshItem(item.id)}>
                  <RefreshCw className='size-3' />
                </Button>
              </TooltipTrigger>
              <TooltipContent className='font-bold'>刷新价格</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' size='icon'
                  className='shrink-0 size-6 text-muted-foreground hover:text-red-500'
                  onClick={() => onDeleteItem(item.id, `${product.name} - ${item.platform}`)}>
                  <Trash2 className='size-3' />
                </Button>
              </TooltipTrigger>
              <TooltipContent className='font-bold'>删除</TooltipContent>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  )
}
