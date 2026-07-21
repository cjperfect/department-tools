import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog, DialogContent, 
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

const PLATFORM_OPTIONS = [
  { id: 'jd', label: '京东' },
  { id: 'taobao', label: '淘宝 / 天猫' },
  { id: 'dy', label: '抖音' },
]

interface MonitorFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: MonitorFormData) => void
}

export interface MonitorFormData {
  keyword: string
  platforms: { platform: string; targetPrice: number }[]
}

export function MonitorForm({ open, onOpenChange, onSubmit }: MonitorFormProps) {
  const [keyword, setKeyword] = useState('')
  const [unifiedPrice, setUnifiedPrice] = useState<number>(0)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['jd', 'taobao', 'dy'])
  const [platformPrices, setPlatformPrices] = useState<Record<string, number>>({})

  const handleUnifiedPriceChange = (price: number) => {
    setUnifiedPrice(price)
    const updated: Record<string, number> = {}
    selectedPlatforms.forEach((p) => { updated[p] = price })
    setPlatformPrices((prev) => ({ ...prev, ...updated }))
  }

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
      if (!prev.includes(id) && unifiedPrice > 0) {
        setPlatformPrices((p) => ({ ...p, [id]: unifiedPrice }))
      }
      return next
    })
  }

  const canSubmit = useMemo(() => {
    if (!keyword.trim() || selectedPlatforms.length === 0) return false
    return selectedPlatforms.every((p) => (platformPrices[p] || 0) > 0)
  }, [keyword, selectedPlatforms, platformPrices])

  const handleSubmit = () => {
    onSubmit?.({
      keyword: keyword.trim(),
      platforms: selectedPlatforms.map((p) => ({
        platform: p,
        targetPrice: platformPrices[p] || 0,
      })),
    })
    setKeyword('')
    setUnifiedPrice(0)
    setPlatformPrices({})
    setSelectedPlatforms(['jd', 'taobao', 'dy'])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>添加价格监控</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
         <div className='space-y-2'>
            <Label>搜索关键词</Label>
            <Input
              placeholder='输入商品关键词搜索...'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label>统一目标价格 (元)</Label>
            <Input
              type='number'
              placeholder='一键设置所有平台价格'
              value={unifiedPrice || ''}
              onChange={(e) => handleUnifiedPriceChange(Number(e.target.value))}
            />
          </div>

          <div className='space-y-2'>
            <Label>监控平台</Label>
            <div className='space-y-2'>
              {PLATFORM_OPTIONS.map((p) => (
                <div key={p.id} className='flex items-center gap-3'>
                  <label className='flex items-center gap-2 text-sm cursor-pointer w-24 shrink-0'>
                    <Checkbox
                      checked={selectedPlatforms.includes(p.id)}
                      onCheckedChange={() => togglePlatform(p.id)}
                    />
                    {p.label}
                  </label>
                  {selectedPlatforms.includes(p.id) && (
                    <Input
                      type='number'
                      placeholder='目标价'
                      className='h-8 text-sm'
                      value={platformPrices[p.id] || ''}
                      onChange={(e) =>
                        setPlatformPrices((prev) => ({
                          ...prev,
                          [p.id]: Number(e.target.value),
                        }))
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            开始监控
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
