import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { deleteUser } from '../api'
import type { User } from '../data/schema'

interface Props {
  currentRow: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersDeleteDialog({ currentRow, open, onOpenChange }: Props) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteUser(currentRow.id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(data?._msg || '操作成功')
      onOpenChange(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            确定要删除用户「{currentRow?.username}」吗？此操作不可撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>取消</Button>
          <Button variant='destructive' onClick={() => mutation.mutate()}>删除</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
