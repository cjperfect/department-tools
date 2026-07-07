import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface MonitorFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: MonitorFormData) => void
}

export interface MonitorFormData {
  url: string
  targetPrice: number
}

export function MonitorForm({ open, onOpenChange, onSubmit }: MonitorFormProps) {
  const [formData, setFormData] = useState<MonitorFormData>({
    url: '',
    targetPrice: 0,
  })

  const handleSubmit = () => {
    onSubmit?.(formData)
    onOpenChange(false)
    setFormData({ url: '', targetPrice: 0 })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加价格监控</DialogTitle>
          <DialogDescription>
            粘贴商品链接，设置目标价格即可开始监控
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
