import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const PLATFORM_OPTIONS = [
  { id: '京东', label: '京东' },
  { id: '淘宝', label: '淘宝' },
  { id: '天猫', label: '天猫' },
  { id: '拼多多', label: '拼多多' },
  { id: '抖音', label: '抖音' },
]

interface MonitorFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: MonitorFormData) => void
}

export interface MonitorFormData {
  url: string
  targetPrice: number
  platforms: string[]
}

export function MonitorForm({ open, onOpenChange, onSubmit }: MonitorFormProps) {
  const [formData, setFormData] = useState<MonitorFormData>({
    url: '',
    targetPrice: 0,
    platforms: ['京东', '淘宝', '天猫'],
  })

  const togglePlatform = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(id)
        ? prev.platforms.filter((p) => p !== id)
        : [...prev.platforms, id],
    }))
  }

  const handleSubmit = () => {
    onSubmit?.(formData)
    onOpenChange(false)
    setFormData({ url: '', targetPrice: 0, platforms: ['京东', '淘宝', '天猫'] })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加价格监控</DialogTitle>
          <DialogDescription>
            粘贴商品链接，设置目标价格和监控平台
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label>商品链接</Label>
            <Input
              placeholder='粘贴电商商品链接...'
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
            />
          </div>
          <div className='space-y-2'>
            <Label>目标价格 (元)</Label>
            <Input
              type='number'
              placeholder='价格低于此值时触发提醒'
              value={formData.targetPrice || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  targetPrice: Number(e.target.value),
                })
              }
            />
          </div>
          <div className='space-y-2'>
            <Label>监控平台</Label>
            <div className='flex flex-wrap gap-3'>
              {PLATFORM_OPTIONS.map((p) => (
                <label
                  key={p.id}
                  className='flex items-center gap-2 text-sm cursor-pointer'
                >
                  <Checkbox
                    checked={formData.platforms.includes(p.id)}
                    onCheckedChange={() => togglePlatform(p.id)}
                  />
                  {p.label}
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>开始监控</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
