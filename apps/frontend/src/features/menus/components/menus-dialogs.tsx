import { useEffect, useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMenus } from './menus-provider'
import { createMenu, updateMenu, deleteMenuAPI, fetchGroups } from '../api'

const ICONS = ['LayoutDashboard', 'BarChart3', 'Eye', 'Users', 'Building2', 'Settings']

const ROLE_OPTIONS = [
  { value: 'super_admin', label: '超级管理员' },
  { value: 'admin', label: '管理员' },
  { value: 'user', label: '普通用户' },
]

export function MenusDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, deleteOpen, setDeleteOpen } = useMenus()
  const queryClient = useQueryClient()

  const { data: groups = [] } = useQuery({
    queryKey: ['menu-groups'],
    queryFn: fetchGroups,
  })

  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [icon, setIcon] = useState('LayoutDashboard')
  const [groupId, setGroupId] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [sortOrder, setSortOrder] = useState('0')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const reset = (row?: any) => {
    setTitle(row?.title || '')
    setUrl(row?.url || '')
    setIcon(row?.icon || 'LayoutDashboard')
    setGroupId(row?.group_id ? String(row.group_id) : (groups[0]?.id ? String(groups[0].id) : ''))
    setSelectedRoles(row?.roles || [])
    setSortOrder(String(row?.sort_order ?? '0'))
    setErrors({})
  }

  useEffect(() => {
    if (open && groups.length > 0) reset(currentRow)
  }, [open, currentRow, groups])

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!title.trim()) e.title = '请输入菜单名称'
    if (!url.trim()) e.url = '请输入路径'
    if (!groupId) e.groupId = '请选择分组'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const createMutation = useMutation({
    mutationFn: () => createMenu({ title, url, icon, group_id: Number(groupId), roles: selectedRoles, sort_order: Number(sortOrder) }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
      toast.success(data?._msg || '操作成功')
      setOpen(false)
      reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => updateMenu(currentRow!.id, { title, url, icon, group_id: Number(groupId), roles: selectedRoles, sort_order: Number(sortOrder) }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
      toast.success(data?._msg || '操作成功')
      setOpen(false)
      setCurrentRow(null)
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMenuAPI(id),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
      toast.success(data?._msg || '操作成功')
      setDeleteOpen(false)
      setCurrentRow(null)
    },
  })

  const handleSubmit = () => {
    if (!validate()) return
    if (currentRow) updateMutation.mutate()
    else createMutation.mutate()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>{currentRow ? '编辑菜单' : '新增菜单'}</DialogTitle>
            <DialogDescription>配置侧边栏导航菜单项。</DialogDescription>
          </DialogHeader>
          <div className='space-y-3'>
            <div>
              <Label>名称</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder='首页' />
              {errors.title && <p className='text-sm text-destructive'>{errors.title}</p>}
            </div>
            <div>
              <Label>路径</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder='/' />
              {errors.url && <p className='text-sm text-destructive'>{errors.url}</p>}
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <Label>图标</Label>
                <select className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm' value={icon} onChange={(e) => setIcon(e.target.value)}>
                  {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <Label>分组</Label>
                <select className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm' value={groupId} onChange={(e) => setGroupId(e.target.value)}>
                  {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                {errors.groupId && <p className='text-sm text-destructive'>{errors.groupId}</p>}
              </div>
            </div>
            <div>
              <Label>角色限制（不选 = 所有人可见）</Label>
              <div className='flex flex-wrap gap-3 mt-1'>
                {ROLE_OPTIONS.map((r) => (
                  <label key={r.value} className='flex items-center gap-1.5 text-sm'>
                    <input
                      type='checkbox'
                      checked={selectedRoles.includes(r.value)}
                      onChange={() => toggleRole(r.value)}
                    />
                    {r.label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>排序</Label>
              <Input type='number' value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>确定要删除菜单「{currentRow?.title}」吗？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction disabled={deleteMutation.isPending} onClick={() => { if (currentRow) deleteMutation.mutate(currentRow.id) }}>
              {deleteMutation.isPending ? '删除中...' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
