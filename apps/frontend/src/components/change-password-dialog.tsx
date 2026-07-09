import { useState } from 'react'
import { z } from 'zod'
import { AxiosError } from 'axios'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '@/api/client'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/password-input'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  dismissible?: boolean
}

const formSchema = z.object({
  oldPassword: z.string().min(1, '请输入原密码'),
  newPassword: z.string().min(1, '请输入新密码'),
  confirmPassword: z.string().min(1, '请确认新密码'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: '两次输入的新密码不一致',
  path: ['confirmPassword'],
})

export function ChangePasswordDialog({ open, onOpenChange, dismissible = true }: Props) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const setMustChangePassword = useAuthStore((s) => s.setMustChangePassword)

  const reset = () => {
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setErrors({})
  }

  const handleSubmit = async () => {
    const result = formSchema.safeParse({ oldPassword, newPassword, confirmPassword })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((e) => { fieldErrors[e.path[0] as string] = e.message })
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    setLoading(true)
    try {
      const { data } = await apiClient.post('/api/auth/change-password', { old_password: oldPassword, new_password: newPassword })
      setMustChangePassword(false)
      toast.success((data as any)?._msg || '密码修改成功，请重新登录')
      reset()
      onOpenChange(false)
      useAuthStore.getState().auth.reset()
      window.location.href = '/sign-in'
    } catch {
      // 错误已由拦截器处理
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={dismissible ? onOpenChange : () => {}}>
      <DialogContent
        className='sm:max-w-md'
        showCloseButton={dismissible}
        onPointerDownOutside={dismissible ? undefined : (e) => e.preventDefault()}
        onEscapeKeyDown={dismissible ? undefined : (e) => e.preventDefault()}
        onInteractOutside={dismissible ? undefined : (e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>修改密码</DialogTitle>
          <DialogDescription>
            {dismissible ? '请输入原密码和新密码。' : '首次登录必须修改密码。'}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='old-pwd'>原密码</Label>
            <PasswordInput id='old-pwd' value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
            {errors.oldPassword && <p className='text-sm text-destructive'>{errors.oldPassword}</p>}
          </div>
          <div className='space-y-2'>
            <Label htmlFor='new-pwd'>新密码</Label>
            <PasswordInput id='new-pwd' value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            {errors.newPassword && <p className='text-sm text-destructive'>{errors.newPassword}</p>}
          </div>
          <div className='space-y-2'>
            <Label htmlFor='confirm-pwd'>确认新密码</Label>
            <PasswordInput id='confirm-pwd' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            {errors.confirmPassword && <p className='text-sm text-destructive'>{errors.confirmPassword}</p>}
          </div>
        </div>
        <DialogFooter>
          {dismissible && <Button variant='outline' onClick={() => { reset(); onOpenChange(false) }}>取消</Button>}
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className='mr-1 h-4 w-4 animate-spin' />}
            确认修改
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
