import { RefreshCw, Trash2, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
interface QueryCardProps {
  productName: string
  imageUrl: string
  platform: string
  productUrl: string
  lowestPrice: number
  lowestPriceDate: string
  currentPrice: number
  updatedAt: string
  isSelected: boolean
  onClick: () => void
  onRefresh: () => void
  onDelete: () => void
}

export function QueryCard({
  productName,
  imageUrl,
  platform,
  productUrl,
  lowestPrice,
  lowestPriceDate,
  currentPrice,
  updatedAt,
  isSelected,
  onClick,
  onRefresh,
  onDelete,
}: QueryCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'border border-amber-700' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className='p-4'>
        {/* 顶部操作栏 */}
        <div className='flex items-start justify-between'>
          <Badge variant='outline' className='text-xs'>
            {platform}
          </Badge>
          <div className='flex gap-1' onClick={(e) => e.stopPropagation()}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='size-7'
                  onClick={onRefresh}
                >
                  <RefreshCw className='size-3.5' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>刷新价格</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-destructive size-7'
                  onClick={onDelete}
                >
                  <Trash2 className='size-3.5' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>删除</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* 商品信息 */}
        <div className='mt-3 flex gap-3'>
          {imageUrl && (
            <img
              src={imageUrl}
              alt={productName}
              className='size-16 shrink-0 rounded-md object-cover'
              loading='lazy'
            />
          )}
          <div className='min-w-0 flex-1'>
            <p className='line-clamp-2 text-sm font-medium'>{productName}</p>
            <p className='mt-1 text-sm'>
              <span className='text-muted-foreground'>最低价格:</span>{' '}
              <span className='font-bold text-green-600'>
                ¥{lowestPrice.toFixed(2)}
              </span>
              <span className='text-muted-foreground'>
                ({lowestPriceDate?.slice(0, 10) || '-'})
              </span>
            </p>
            <p className='text-sm'>
              <span className='text-muted-foreground'>当前价格:</span>{' '}
              <span className='font-medium'>¥{currentPrice.toFixed(2)}</span>
            </p>
            <p className='text-xs text-muted-foreground text-right'>
              比价时间: {new Date(updatedAt).toLocaleString('zh-CN')}
            </p>
          </div>
        </div>

        {/* 直达链接 */}
        <a
          href={productUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='text-primary mt-3 flex items-center gap-1 text-xs hover:underline'
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className='size-3' />
          查看商品
        </a>
      </CardContent>
    </Card>
  )
}
