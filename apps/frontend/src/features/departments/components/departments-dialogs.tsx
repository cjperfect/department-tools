import { useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useDepartments } from './departments-provider'
import { createDepartment, updateDepartment, deleteDepartment } from '../api'

const formSchema = z.object({
  name: z.string().min(1, '请输入部门名称'),
})

type DepartmentForm = z.infer<typeof formSchema>

export function DepartmentsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, deleteOpen, setDeleteOpen } =
    useDepartments()
  const queryClient = useQueryClient()

  const form = useForm<DepartmentForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '' },
  })

  // 编辑时回填当前部门名称
  useEffect(() => {
    if (open && currentRow) {
      form.reset({ name: currentRow.name })
    } else if (!open) {
      form.reset({ name: '' })
    }
  }, [open, currentRow, form])

  const createMutation = useMutation({
    mutationFn: (name: string) => createDepartment(name),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      toast.success(data?._msg || '操作成功')
      setOpen(false)
      form.reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      updateDepartment(id, name),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      toast.success(data?._msg || '操作成功')
      setOpen(false)
      setCurrentRow(null)
      form.reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteDepartment(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      toast.success(data?._msg || '操作成功')
      setDeleteOpen(false)
      setCurrentRow(null)
    },
  })

  function onSubmit(data: DepartmentForm) {
    if (currentRow) {
      updateMutation.mutate({ id: currentRow.id, name: data.name })
    } else {
      createMutation.mutate(data.name)
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          if (!v) {
            form.reset({ name: '' })
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentRow ? '编辑部门' : '新增部门'}</DialogTitle>
            <DialogDescription>
              {currentRow ? '修改部门名称。' : '添加一个新的部门。'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form id='department-form' onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>部门名称</FormLabel>
                    <FormControl>
                      <Input placeholder='请输入部门名称' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <DialogFooter>
            <Button
              type='submit'
              form='department-form'
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? '保存中...'
                : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除部门「{currentRow?.name}」吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (currentRow) deleteMutation.mutate(currentRow.id)
              }}
            >
              {deleteMutation.isPending ? '删除中...' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
