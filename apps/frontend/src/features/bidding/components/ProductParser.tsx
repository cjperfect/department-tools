import { useState, useEffect } from 'react'
import {
  Search,
  Trash2,
  RefreshCw,
  Star,
  ShoppingCart,
  Store,
  Palette,
  Wallet,
  Puzzle,
  ShieldCheck,
  Headphones,
  TrendingUp,
  Lightbulb,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { analyzeProduct, searchRecords, deleteRecord, type ProductAnalysis } from '@/api/bidding'

const SAMPLE_URLS = [
  { url: 'https://item.taobao.com/item.htm?id=694593508978', name: '金运A5蓝牙耳机' },
  { url: 'https://item.taobao.com/item.htm?id=975382453065', name: 'iPhone 17 Pro Max' },
  { url: 'https://item.jd.com/100012345678.html', name: '索尼 WH-1000XM6' },
]

const PLATFORM_COLORS: Record<string, string> = {
  '京东': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  '淘宝': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  '天猫': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  '拼多多': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  '抖音': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
}

const DIMENSIONS = [
  { key: 'design', label: '设计', icon: Palette },
  { key: 'pricing', label: '定价', icon: Wallet },
  { key: 'functionality', label: '功能', icon: Puzzle },
  { key: 'quality', label: '质量', icon: ShieldCheck },
  { key: 'service', label: '客服', icon: Headphones },
] as const

export function ProductParser() {
  const [url, setUrl] = useState('')
  const [records, setRecords] = useState<ProductAnalysis[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [searching, setSearching] = useState(false)

  // 页面加载时从后端获取历史分析记录
  const loadAllRecords = () => {
    setSearching(true)
    searchRecords('')
      .then(setRecords)
      .catch(() => {})
      .finally(() => {
        setSearching(false)
        setFetching(false)
      })
  }

  useEffect(() => {
    loadAllRecords()
  }, [])

  const handleSearchRecords = async () => {
    const q = searchInput.trim()
    if (!q) return
    setSearching(true)
    try {
      const results = await searchRecords(q)
      setRecords(results)
    } catch {
      toast.error('搜索失败')
    } finally {
      setSearching(false)
    }
  }

  const handleClearSearch = () => {
    setSearchInput('')
    loadAllRecords()
  }

  const handleAnalyze = async (analyzeUrl?: string) => {
    const targetUrl = (analyzeUrl ?? url).trim()
    if (!targetUrl) return
    setLoading(true)

    try {
      const record = await analyzeProduct(targetUrl)
      setRecords((prev) => {
        // 刷新：替换旧记录；新分析：插入顶部
        const filtered = prev.filter((r) => r.id !== record.id)
        return [record, ...filtered]
      })
      setUrl('')
      toast.success(`已完成「${record.name}」竞品分析`)
    } catch {
      toast.error('未找到该商品，请检查链接')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const id = deleteId
    setDeleteId(null)
    try {
      await deleteRecord(id)
    } catch {
      // 后端删除失败也清除前端记录
    }
    setRecords((prev) => prev.filter((r) => r.id !== id))
    toast.success('已移除分析记录')
  }

  return (
    <div className='space-y-6'>
      {/* URL Input */}
      <div className='flex max-w-xl gap-2'>
        <div className='relative flex-1'>
          <Search className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='粘贴竞品电商链接，如 https://item.jd.com/100012345678.html'
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            className='pl-9 font-mono text-sm'
          />
        </div>
        <Button onClick={() => handleAnalyze()} disabled={loading}>
          {loading ? (
            <Loader2 className='mr-1 size-4 animate-spin' />
          ) : (
            <Search className='mr-1 size-4' />
          )}
          {loading ? '分析中...' : '开始分析'}
        </Button>
      </div>
      {(
        <div className='mt-3 flex gap-2 text-xs text-muted-foreground'>
          <span>示例：</span>
          {SAMPLE_URLS.map((s) => (
              <button
                key={s.url}
                className='max-w-64 truncate rounded bg-muted px-2 py-0.5 hover:bg-muted/70'
                onClick={() => setUrl(s.url)}
              >
                {s.name}
              </button>
            ))}
        </div>
      )}

      {/* History Records */}
      {fetching ? (
        <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
          <Loader2 className='mb-4 size-8 animate-spin opacity-20' />
          <p className='text-sm'>加载历史记录...</p>
        </div>
      ) : records.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
          <ShoppingCart className='mb-4 size-16 opacity-20' />
          <p className='text-lg font-medium'>粘贴竞品链接开始分析</p>
          <p className='mt-1 text-sm'>
            支持京东、天猫、拼多多链接，点击上方示例快速体验
          </p>
        </div>
      ) : null}

      {records.length > 0 && (
        <div className='flex max-w-md gap-2 ml-auto'>
          <div className='relative flex-1'>
            <Search className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='搜索已分析的竞品名称、平台或店铺...'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchRecords()}
              className='pl-9'
            />
          </div>
          <Button onClick={handleSearchRecords} disabled={searching}>
            {searching ? (
              <Loader2 className='mr-1 size-4 animate-spin' />
            ) : (
              <Search className='mr-1 size-4' />
            )}
            搜索
          </Button>
          <Button
            variant='outline'
            onClick={handleClearSearch}
            disabled={searching}
          >
            <Trash2 className='mr-1 size-4' />
            清除
          </Button>
        </div>
      )}

      {records.map((record) => (
        <AnalysisCard
          key={record.id}
          record={normalizeRecord(record)}
          onDelete={() => setDeleteId(record.id)}
          onRefresh={() => handleAnalyze(record.url)}
        />
      ))}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null)
        }}
        title='移除分析记录'
        desc={
          <>
            确定要移除「
            <strong>{records.find((r) => r.id === deleteId)?.name}</strong>
            」的分析结果吗？
          </>
        }
        confirmText='移除'
        cancelBtnText='取消'
        destructive
        handleConfirm={handleDelete}
      />
    </div>
  )
}

// ====== Analysis Card ======

const scoreColor = (s: number) =>
  s >= 8 ? 'text-green-600' : s >= 6 ? 'text-yellow-600' : 'text-red-600'

function getDimScore(record: ProductAnalysis, key: string): number {
  const dim = record[key as keyof ProductAnalysis]
  if (!dim || typeof dim !== 'object' || !('score' in dim)) return 0
  return (dim as { score: number }).score
}

/** 确保所有字段都有兜底值，避免接口数据缺失时报错 */
function normalizeRecord(r: ProductAnalysis): ProductAnalysis {
  const EMPTY_DIM = { score: 0, highlights: [], warnings: [] }
  return {
    ...r,
    currentPrice: r.currentPrice ?? 0,
    originalPrice: r.originalPrice ?? 0,
    monthlySales: r.monthlySales ?? 0,
    rating: r.rating ?? 0,
    reviews: r.reviews ?? 0,
    design: { ...EMPTY_DIM, packaging: '', colorOptions: [], sizeOptions: [], userLikes: [], userHates: [], gapOpportunities: [], ...(r.design || {}) },
    pricing: { ...EMPTY_DIM, competitorPrice: 0, ourPrice: 0, hasFreeTrial: false, hasInstallment: false, plans: [], pricingGaps: [], ...(r.pricing || {}) },
    functionality: { ...EMPTY_DIM, solves: [], gaps: [], painPoints: [], ...(r.functionality || {}) },
    quality: { ...EMPTY_DIM, easeOfUse: '', durability: '', qualityIssues: [], userFeedback: { positive: [], negative: [] }, ...(r.quality || {}) },
    service: { ...EMPTY_DIM, responseStyle: '', avgResponseTime: '', commonComplaints: [], serviceLikes: [], ...(r.service || {}) },
  }
}

function AnalysisCard({
  record,
  onDelete,
  onRefresh,
}: {
  record: ProductAnalysis
  onDelete: () => void
  onRefresh: () => void
}) {
  const avgScore = (
    ((record.design as any)?.score ?? 0) +
    ((record.pricing as any)?.score ?? 0) +
    ((record.functionality as any)?.score ?? 0) +
    ((record.quality as any)?.score ?? 0) +
    ((record.service as any)?.score ?? 0)
  ).toFixed(1)

  const topGaps = [
    ...((record.design as any)?.gapOpportunities ?? []).slice(0, 2),
    ...((record.functionality as any)?.gaps ?? []).slice(0, 1),
    ...((record.pricing as any)?.pricingGaps ?? []).slice(0, 2),
  ].slice(0, 5)

  return (
    <Card>
      {/* Header */}
      <CardHeader className='pb-2'>
        <div className='flex items-start justify-between'>
          <div className='flex min-w-0 gap-4'>
            <div className='flex aspect-square size-14 shrink-0 items-center justify-center rounded-xl bg-muted text-3xl'>
              {record.image}
            </div>
            <div className='min-w-0'>
              <CardTitle className='text-base'>{record.name}</CardTitle>
              <CardDescription className='mt-0.5 flex items-center gap-2 text-xs'>
                <Badge className={`text-xs ${PLATFORM_COLORS[record.platform] || ''}`}>
                  {record.platform}
                </Badge>
                <Store className='size-3' /> {record.shopName}
                <Star className='size-3 fill-yellow-400 text-yellow-400' />
                {record.rating} ({record.reviews.toLocaleString()}评)
                <span className='text-muted-foreground'>
                  解析于{' '}
                  {new Date(record.analyzedAt).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </CardDescription>
            </div>
          </div>
          <div className='flex shrink-0 items-center gap-1'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-muted-foreground hover:text-blue-600'
                  onClick={onRefresh}
                >
                  <RefreshCw className='size-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent className='font-bold'>重新分析</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-red-500 hover:bg-red-50 hover:text-red-600'
                  onClick={onDelete}
                >
                  <Trash2 className='size-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent className='font-bold'>删除记录</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Score Overview */}
        <div className='flex items-center gap-4 rounded-lg bg-muted/50 p-3'>
          <div className='shrink-0 text-center'>
            <div
              className={`text-2xl font-bold ${scoreColor(Number(avgScore))}`}
            >
              {avgScore}
            </div>
            <div className='text-xs text-muted-foreground'>综合评分</div>
          </div>
          <Separator orientation='vertical' className='h-10' />
          <div className='grid flex-1 grid-cols-5 gap-2'>
            {DIMENSIONS.map(({ key, label, icon: Icon }) => {
              const s = getDimScore(record, key)
              return (
                <div key={key} className='text-center'>
                  <Icon className='mx-auto mb-0.5 size-4 text-muted-foreground' />
                  <div className={`text-sm font-bold ${scoreColor(s)}`}>
                    {s}
                  </div>
                  <div className='text-[10px] text-muted-foreground'>
                    {label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Advantage / Gap Summary */}
        <div className='flex gap-3 text-sm'>
          <div className='flex-1 space-y-1 rounded-lg bg-green-50 p-3 dark:bg-green-950/30'>
            <p className='flex items-center gap-1 font-medium text-green-700 dark:text-green-400'>
              <TrendingUp className='size-3.5' /> 优势
            </p>
            <ul className='space-y-0.5 text-xs text-green-700/80 dark:text-green-400/80'>
              {topGaps.slice(0, 3).map((g, i) => (
                <li key={i}>· {g}</li>
              ))}
            </ul>
          </div>
          <div className='flex-1 space-y-1 rounded-lg bg-amber-50 p-3 dark:bg-amber-950/30'>
            <p className='flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400'>
              <AlertTriangle className='size-3.5' /> 机会点
            </p>
            <ul className='space-y-0.5 text-xs text-amber-700/80 dark:text-amber-400/80'>
              {topGaps.slice(3).map((g, i) => (
                <li key={i}>· {g}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Dimension Tabs */}
        <Tabs defaultValue='design'>
          <TabsList className='w-full'>
            {DIMENSIONS.map(({ key, label }) => (
              <TabsTrigger key={key} value={key} className='flex-1 text-xs'>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Design Tab */}
          <TabsContent value='design' className='mt-3 space-y-3'>
            <DimensionContent
              title='外观与设计'
              score={record.design.score}
              rows={[
                { label: '包装', value: record.design.packaging },
                {
                  label: '可选颜色',
                  value: record.design.colorOptions.join('、'),
                },
                {
                  label: '可选尺寸',
                  value: record.design.sizeOptions.join('、'),
                },
              ]}
            />
            <FeedbackBlock
              likes={record.design.userLikes}
              hates={record.design.userHates}
            />
            <GapBlock
              title='差异机会'
              items={record.design.gapOpportunities}
              icon={Lightbulb}
            />
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value='pricing' className='mt-3 space-y-3'>
            <div className='flex gap-4'>
              <div className='flex-1 rounded-lg bg-muted p-3 text-center'>
                <div className='text-xs text-muted-foreground'>竞品价格</div>
                <div className='text-xl font-bold text-red-600'>
                  ¥{record.pricing.competitorPrice.toLocaleString()}
                </div>
              </div>
              <div className='flex-1 rounded-lg bg-muted p-3 text-center'>
                <div className='text-xs text-muted-foreground'>我方价格</div>
                <div className='text-xl font-bold text-green-600'>
                  ¥{record.pricing.ourPrice.toLocaleString()}
                </div>
              </div>
            </div>
            <DimensionContent
              title='定价策略'
              score={record.pricing.score}
              rows={[
                {
                  label: '分期付款',
                  value: record.pricing.hasInstallment
                    ? '✅ 支持'
                    : '❌ 不支持',
                },
                {
                  label: '免费试用',
                  value: record.pricing.hasFreeTrial ? '✅ 支持' : '❌ 不支持',
                },
                {
                  label: '套餐方案',
                  value: record.pricing.plans
                    .map((p) => `${p.name} ¥${p.price}`)
                    .join(' / '),
                },
              ]}
            />
            <GapBlock
              title='定价差距'
              items={record.pricing.pricingGaps}
              icon={AlertTriangle}
            />
          </TabsContent>

          {/* Functionality Tab */}
          <TabsContent value='functionality' className='mt-3 space-y-3'>
            <DimensionContent
              title='功能与实用性'
              score={record.functionality.score}
              rows={[
                {
                  label: '解决场景',
                  value: record.functionality.solves.join('、'),
                },
                {
                  label: '功能缺口',
                  value: record.functionality.gaps.join('、'),
                },
              ]}
            />
            <FeedbackBlock
              likes={[]}
              hates={record.functionality.painPoints}
              hateLabel='用户痛点'
            />
          </TabsContent>

          {/* Quality Tab */}
          <TabsContent value='quality' className='mt-3 space-y-3'>
            <DimensionContent
              title='产品质量'
              score={record.quality.score}
              rows={[
                { label: '易用性', value: record.quality.easeOfUse },
                { label: '耐用性', value: record.quality.durability },
              ]}
            />
            <GapBlock
              title='质量问题'
              items={record.quality.qualityIssues}
              icon={AlertTriangle}
            />
            <FeedbackBlock
              likes={record.quality.userFeedback.positive}
              hates={record.quality.userFeedback.negative}
            />
          </TabsContent>

          {/* Service Tab */}
          <TabsContent value='service' className='mt-3 space-y-3'>
            <DimensionContent
              title='客户服务'
              score={record.service.score}
              rows={[
                { label: '响应风格', value: record.service.responseStyle },
                { label: '平均响应', value: record.service.avgResponseTime },
              ]}
            />
            <FeedbackBlock
              likes={record.service.serviceLikes}
              hates={record.service.commonComplaints}
              likeLabel='服务亮点'
              hateLabel='常见投诉'
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// ====== Sub-components ======

function DimensionContent({
  title,
  score,
  rows,
}: {
  title: string
  score: number
  rows: { label: string; value: string }[]
}) {
  return (
    <div className='rounded-lg border p-3'>
      <div className='mb-2 flex items-center justify-between'>
        <h4 className='text-sm font-medium'>{title}</h4>
        <Badge variant='secondary'>{score} / 10</Badge>
      </div>
      <div className='space-y-1.5'>
        {rows.map((r) => (
          <div key={r.label} className='flex gap-2 text-sm'>
            <span className='shrink-0 text-muted-foreground'>{r.label}：</span>
            <span>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FeedbackBlock({
  likes,
  hates,
  likeLabel = '用户喜欢',
  hateLabel = '用户吐槽',
}: {
  likes: string[]
  hates: string[]
  likeLabel?: string
  hateLabel?: string
}) {
  return (
    <div className='grid grid-cols-2 gap-3'>
      <div className='space-y-1 rounded-lg bg-green-50 p-3 dark:bg-green-950/30'>
        <p className='text-xs font-medium text-green-700 dark:text-green-400'>
          👍 {likeLabel}
        </p>
        {likes.length > 0 ? (
          likes.map((l, i) => (
            <p
              key={i}
              className='text-xs text-green-700/70 dark:text-green-400/70'
            >
              · {l}
            </p>
          ))
        ) : (
          <p className='text-xs text-muted-foreground'>暂无</p>
        )}
      </div>
      <div className='space-y-1 rounded-lg bg-red-50 p-3 dark:bg-red-950/30'>
        <p className='text-xs font-medium text-red-700 dark:text-red-400'>
          👎 {hateLabel}
        </p>
        {hates.length > 0 ? (
          hates.map((h, i) => (
            <p key={i} className='text-xs text-red-700/70 dark:text-red-400/70'>
              · {h}
            </p>
          ))
        ) : (
          <p className='text-xs text-muted-foreground'>暂无</p>
        )}
      </div>
    </div>
  )
}

function GapBlock({
  title,
  items,
  icon: Icon,
}: {
  title: string
  items: string[]
  icon: React.ElementType
}) {
  return (
    <div className='space-y-1 rounded-lg bg-amber-50 p-3 dark:bg-amber-950/30'>
      <p className='flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400'>
        <Icon className='size-3.5' /> {title}
      </p>
      {items.map((item, i) => (
        <p key={i} className='text-xs text-amber-700/70 dark:text-amber-400/70'>
          · {item}
        </p>
      ))}
    </div>
  )
}
