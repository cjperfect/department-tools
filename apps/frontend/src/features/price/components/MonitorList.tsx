import { useState, useEffect, useRef } from 'react'
import { ChevronDown, ChevronsDownUp, ExternalLink, Loader2, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { MonitorForm, type MonitorFormData } from './MonitorForm'
import { ImageViewer } from '@/components/ImageViewer'
import {
  addMonitor, getMonitorList, deleteProduct, deleteItem,
  refreshProduct,
  type MonitorProduct,
  type MonitorItem,
} from '@/api/price'
import { toast } from 'sonner'

const PLATFORM_COLORS: Record<string, string> = {
  'jd': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'taobao': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'tmall': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  'pdd': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  'dy': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
}

const PLATFORM_LABELS: Record<string, string> = {
  'jd': '京东',
  'taobao': '淘宝',
  'tmall': '天猫',
  'pdd': '拼多多',
  'dy': '抖音',
}

interface Props {
  products: MonitorProduct[]
  setProducts: React.Dispatch<React.SetStateAction<MonitorProduct[]>>
  loading: boolean
}

export function MonitorList({ products, setProducts, loading }: Props) {
  const [formOpen, setFormOpen] = useState(false)
  const [deleteInfo, setDeleteInfo] = useState<{ productId?: number; itemId?: number; label?: string } | null>(null)

  // 平台折叠（key: `${productId}-${platform}`）
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<string>>(new Set())

  const [refreshLoading, setRefreshLoading] = useState<number | null>(null)

  // 自动刷新
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [intervalHours, setIntervalHours] = useState(1)
  const productsRef = useRef(products)
  productsRef.current = products

  const togglePlatform = (key: string) => {
    setExpandedPlatforms((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const expandAllPlatforms = (productId: number, platforms: string[]) => {
    setExpandedPlatforms((prev) => {
      const next = new Set(prev)
      for (const p of platforms) {
        next.add(`${productId}-${p}`)
      }
      return next
    })
  }

  const collapseAllPlatforms = (productId: number, platforms: string[]) => {
    setExpandedPlatforms((prev) => {
      const next = new Set(prev)
      for (const p of platforms) {
        next.delete(`${productId}-${p}`)
      }
      return next
    })
  }

  const handleAdd = async (data: MonitorFormData) => {
    await addMonitor({
      keyword: data.keyword,
      items: data.platforms
        .filter((p) => p.targetPrice > 0)
        .map((p) => ({ platform: p.platform, targetPrice: p.targetPrice })),
    })
    const list = await getMonitorList()
    setProducts(list)
    setFormOpen(false)
    toast.success(`已添加「${data.keyword}」`)
  }

  const handleRefreshProduct = async (productId: number) => {
    setRefreshLoading(productId)
    try {
      await refreshProduct(productId)
      const list = await getMonitorList()
      setProducts(list)
      toast.success('已刷新')
    } catch {
      toast.error('刷新失败')
    } finally {
      setRefreshLoading(null)
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

  // 自动刷新定时器（递归 setTimeout，避免 setInterval 漂移）
  useEffect(() => {
    if (!autoRefresh) return
    let timer: ReturnType<typeof setTimeout>
    const run = async () => {
      const start = Date.now()
      const current = productsRef.current
      for (const p of current) {
        await handleRefreshProduct(p.id)
      }
      // 减去本次执行耗时，补偿漂移
      const elapsed = Date.now() - start
      const next = Math.max(1000, intervalHours * 3600 * 1000 - elapsed)
      timer = setTimeout(run, next)
    }
    timer = setTimeout(run, intervalHours * 3600 * 1000)
    return () => clearTimeout(timer)
  }, [autoRefresh, intervalHours])

  if (loading) return <div className='py-12 text-center text-muted-foreground'>加载中...</div>

  return (
    <>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div className='flex items-center gap-2'>
            <CardTitle>监控列表</CardTitle>
          </div>
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <Switch
                id='auto-refresh'
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <label
                htmlFor='auto-refresh'
                className='text-sm font-medium text-muted-foreground cursor-pointer select-none'
              >
                自动刷新
              </label>
            </div>
            {autoRefresh && (
              <div className='flex items-center gap-1.5'>
                <span className='text-sm text-muted-foreground'>间隔</span>
                <Select
                  value={String(intervalHours)}
                  onValueChange={(v) => setIntervalHours(Number(v))}
                >
                  <SelectTrigger className='h-6 w-24 text-sm'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 6, 12, 24].map((h) => (
                      <SelectItem key={h} value={String(h)}>
                        {h} 小时
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button size='sm' onClick={() => setFormOpen(true)}>
              <Plus className='mr-1 size-4' />
              添加监控
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className='py-12 text-center text-muted-foreground'>暂无监控产品</div>
          ) : (
            <div className='grid gap-4 grid-cols-1'>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  expandedPlatforms={expandedPlatforms}
                  onTogglePlatform={(key) => togglePlatform(key)}
                  onExpandAll={() => expandAllPlatforms(product.id, [...new Set(product.items.map((it) => it.platform))])}
                  onCollapseAll={() => collapseAllPlatforms(product.id, [...new Set(product.items.map((it) => it.platform))])}
                  onDeleteProduct={() => setDeleteInfo({ productId: product.id, label: product.keyword })}
                  onDeleteItem={(itemId, label) => setDeleteInfo({ itemId, label })}
                  onRefreshProduct={() => handleRefreshProduct(product.id)}
                  refreshLoading={refreshLoading}
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
    </>
  )
}

// ====================================================================
// 辅助：按平台分组
// ====================================================================

function groupByPlatform(items: MonitorItem[]): { platform: string; items: MonitorItem[] }[] {
  const map = new Map<string, MonitorItem[]>()
  for (const item of items) {
    const list = map.get(item.platform)
    if (list) {
      list.push(item)
    } else {
      map.set(item.platform, [item])
    }
  }
  return [...map.entries()].map(([platform, items]) => ({ platform, items }))
}

// ====================================================================
// 产品卡片
// ====================================================================

function ProductCard({
  product,
  expandedPlatforms,
  onTogglePlatform,
  onExpandAll,
  onCollapseAll,
  onDeleteProduct,
  onDeleteItem,
  onRefreshProduct,
  refreshLoading,
}: {
  product: MonitorProduct
  expandedPlatforms: Set<string>
  onTogglePlatform: (key: string) => void
  onExpandAll: () => void
  onCollapseAll: () => void
  onDeleteProduct: () => void
  onDeleteItem: (id: number, label: string) => void
  onRefreshProduct: () => void
  refreshLoading: number | null
}) {
  const groups = groupByPlatform(product.items)
  const allExpanded = groups.every((g) => expandedPlatforms.has(`${product.id}-${g.platform}`))

  return (
    <div className='rounded-lg border'>
      {/* 产品头部 */}
      <div className='flex items-center justify-between px-4 py-3'>
        <div className='flex items-center gap-3'>
          {product.image.startsWith('http') ? (
            <ImageViewer src={product.image} alt={product.keyword} className='size-8 rounded' />
          ) : (
            <span className='text-2xl'>{product.image}</span>
          )}
          <div>
            <h3 className='font-medium text-base'>{product.keyword}</h3>
            <p className='text-sm text-muted-foreground'>
              {groups.length} 个平台 · {product.items.length} 条记录
              {product.createdAt && (
                <span className='ml-2'>添加于 {new Date(product.createdAt).toLocaleString('zh-CN')}</span>
              )}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-1'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                onClick={onRefreshProduct}
                className='h-7 text-sm gap-1'
                disabled={refreshLoading === product.id}
              >
                {refreshLoading === product.id ? (
                  <Loader2 className='size-3 animate-spin' strokeWidth={2.5} />
                ) : (
                  <RefreshCw className='size-3' strokeWidth={2.5} />
                )}
                批量刷新
              </Button>
            </TooltipTrigger>
            <TooltipContent className='font-bold'>刷新全部平台价格</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                onClick={allExpanded ? onCollapseAll : onExpandAll}
                className='h-7 text-sm gap-1'
              >
                <ChevronsDownUp className='size-3' strokeWidth={2.5} />
                {allExpanded ? '全部折叠' : '全部展开'}
              </Button>
            </TooltipTrigger>
            <TooltipContent className='font-bold'>{allExpanded ? '折叠所有平台' : '展开所有平台'}</TooltipContent>
          </Tooltip>
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

      {/* 平台列表 */}
      <Separator />
      <div className='px-4 py-2 space-y-1'>
            {groups.map((group) => {
              const platformKey = `${product.id}-${group.platform}`
              const isExpanded = expandedPlatforms.has(platformKey)
              return (
                <div key={group.platform} className='rounded-md border'>
                  {/* 平台头部 — 可折叠 */}
                  <button
                    type='button'
                    className='w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/30 transition-colors text-left'
                    onClick={() => onTogglePlatform(platformKey)}
                  >
                    <ChevronDown
                      className={`size-3.5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                        isExpanded ? 'rotate-0' : '-rotate-90'
                      }`}
                    />
                    <Badge className={`shrink-0 text-sm ${PLATFORM_COLORS[group.platform] || ''}`}>
                      {PLATFORM_LABELS[group.platform] || group.platform}
                    </Badge>
                    <span className='text-sm text-muted-foreground'>
                      {group.items.length} 条记录
                    </span>
                  </button>

                  {/* 平台下的条目列表 */}
                  {isExpanded && (
                    <>
                      <Separator />
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 p-2'>
                        {group.items.map((item) => (
                          <div key={item.id} className='flex items-center gap-2 rounded-md border p-2 text-base hover:bg-muted/30 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer'>
                            {/* 商品图片 */}
                            {item.image ? (
                              <ImageViewer src={item.image} alt={item.name || item.platform} className='size-14 rounded shrink-0 bg-muted' />
                            ) : (
                              <div className='size-14 rounded shrink-0 bg-muted flex items-center justify-center text-muted-foreground text-sm'>
                                无图
                              </div>
                            )}

                            {/* 中间信息 */}
                            <div className='flex-1 min-w-0 space-y-0.5'>
                              <div className='flex items-center gap-1.5'>
                                {item.name && (
                                  <span className='font-medium text-sm leading-relaxed truncate'>{item.name}</span>
                                )}
                              </div>
                              {item.shopName && (
                                <p className='text-sm text-muted-foreground truncate'>{item.shopName}</p>
                              )}
                              <div className='grid grid-cols-3 gap-1 text-sm'>
                                <div>
                                  <span className='text-muted-foreground text-xs'>当前价</span>
                                  <span className='font-mono font-medium block'>¥{item.currentPrice.toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className='text-muted-foreground text-xs'>目标价</span>
                                  <span className='font-mono block'>¥{item.targetPrice.toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className='text-muted-foreground text-xs'>相差</span>
                                  <span className={`font-mono block ${item.diff <= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {item.diff > 0 ? '+' : '-'}¥{Math.abs(item.diff).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* 右侧操作 */}
                            <div className='flex items-center gap-0.5 shrink-0'>
                              {item.url && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <a href={item.url} target='_blank' rel='noopener noreferrer'
                                      className='inline-flex items-center justify-center size-7 text-muted-foreground hover:text-blue-600 rounded-md hover:bg-muted'>
                                      <ExternalLink className='size-3.5' />
                                    </a>
                                  </TooltipTrigger>
                                  <TooltipContent className='font-bold'>打开商品链接</TooltipContent>
                                </Tooltip>
                              )}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant='ghost' size='icon'
                                    className='size-7 text-muted-foreground hover:text-red-500'
                                    onClick={() => onDeleteItem(item.id, item.name)}>
                                    <Trash2 className='size-3' />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className='font-bold'>删除</TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )
    }
