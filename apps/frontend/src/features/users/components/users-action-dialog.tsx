import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useUsers } from './users-provider'
import { createUser, updateUser } from '../api'
import { fetchDepartments } from '@/features/departments/api'
import { roles } from '../data/data'
import { useAuthStore } from '@/stores/auth-store'
import { copyToClipboard } from '@/lib/utils'

const formSchema = z.object({
  username: z.string().min(1, '请填写用户名。'),
  employee_id: z.string().default(''),
  department_id: z.string().optional(),
  role: z.string().optional(),
})

type UserForm = z.infer<typeof formSchema>

interface Props {
  currentRow?: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({ currentRow, open, onOpenChange }: Props) {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((s) => s.auth.user)
  const isEdit = !!currentRow
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [copied, setCopied] = useState(false)

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
  })

  const currentRole = currentUser?.role || ''
  const roleOptions = currentRole === 'super_admin'
    ? [{ value: 'admin', label: '管理员' }, { value: 'user', label: '普通用户' }]
    : [{ value: 'user', label: '普通用户' }]

  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? { username: currentRow.username, employee_id: currentRow.employee_id || '', department_id: currentRow.department_id ? String(currentRow.department_id) : '' }
      : { username: '', employee_id: '', department_id: '', role: 'user' },
  })

  const createMutation = useMutation({
    mutationFn: (input: Record<string, unknown>) => createUser(input),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      if (data?.rawPassword) {
        setGeneratedPassword(data.rawPassword)
      } else {
        toast.success(data?._msg || '操作成功')
        form.reset()
        onOpenChange(false)
      }
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: Record<string, unknown> }) => updateUser(id, input),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(data?._msg || '操作成功')
      form.reset()
      onOpenChange(false)
    },
  })

  const onSubmit = (values: UserForm) => {
    if (isEdit && currentRow) {
      updateMutation.mutate({ id: currentRow.id, input: values })
    } else {
      createMutation.mutate({
        username: values.username,
        employee_id: values.employee_id,
        department_id: values.department_id ? Number(values.department_id) : undefined,
        role: values.role || 'user',
        status: 'active',
        password: 'Temp123456',
      } as Record<string, unknown>)
    }
  }

  const copyPwd = async () => {
    await copyToClipboard(generatedPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={(state) => {
      if (!state) { form.reset(); form.clearErrors(); setGeneratedPassword('') }
      onOpenChange(state)
    }}>
      <DialogContent className='sm:max-w-md'>
        {generatedPassword ? (
          <>
            <DialogHeader>
              <DialogTitle>用户已创建</DialogTitle>
              <DialogDescription>首次登录必须修改密码，请将以下初始密码告知用户。</DialogDescription>
            </DialogHeader>
            <div className='rounded-lg border bg-muted/30 p-4 text-center'>
              <p className='mb-2 text-sm text-muted-foreground'>初始密码</p>
              <p className='mb-3 text-2xl font-mono font-bold tracking-wider'>{generatedPassword}</p>
              <Button variant='outline' size='sm' onClick={copyPwd}>
                {copied ? <><Check className='mr-1 h-4 w-4' />已复制</> : <><Copy className='mr-1 h-4 w-4' />复制密码</>}
              </Button>
            </div>
            <DialogFooter><Button onClick={() => { setGeneratedPassword(''); form.reset(); onOpenChange(false) }}>关闭</Button></DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{isEdit ? '编辑用户' : '添加新用户'}</DialogTitle>
              <DialogDescription>{isEdit ? '修改用户信息。' : '创建新用户，系统将自动生成初始密码。'}</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form id='user-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <FormField control={form.control} name='username' render={({ field }) => (
                  <FormItem>
                    <FormLabel>用户名</FormLabel>
                    <FormControl><Input placeholder='zhangsan' {...field} disabled={isEdit} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name='employee_id' render={({ field }) => (
                  <FormItem>
                    <FormLabel>工号</FormLabel>
                    <FormControl><Input placeholder='EMP001' {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {!isEdit && (
                  <FormField control={form.control} name='role' render={({ field }) => (
                    <FormItem>
                      <FormLabel>角色</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className='flex gap-4'>
                          {roleOptions.map((r) => (
                            <div key={r.value} className='flex items-center gap-2'>
                              <RadioGroupItem value={r.value} id={`role-${r.value}`} />
                              <Label htmlFor={`role-${r.value}`}>{r.label}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
                <FormField control={form.control} name='department_id' render={({ field }) => (
                  <FormItem>
                    <FormLabel>部门</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl><SelectTrigger><SelectValue placeholder='选择部门' /></SelectTrigger></FormControl>
                      <SelectContent>
                        {departments.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </form>
            </Form>
            <DialogFooter>
              <Button type='submit' form='user-form'>{isEdit ? '保存' : '创建'}</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
