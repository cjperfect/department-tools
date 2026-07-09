import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useMenus } from './menus-provider'
import type { Menu } from '../api'

const ROLE_LABEL: Record<string, string> = {
  super_admin: '超级管理员',
  admin: '管理员',
  user: '普通用户',
}

export function MenusTable({ data }: { data: Menu[] }) {
  const { setOpen, setCurrentRow, setDeleteOpen } = useMenus()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='w-16'>排序</TableHead>
          <TableHead>名称</TableHead>
          <TableHead>路径</TableHead>
          <TableHead>图标</TableHead>
          <TableHead>分组</TableHead>
          <TableHead>角色</TableHead>
          <TableHead className='w-24'>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className='text-center text-muted-foreground'>暂无数据</TableCell>
          </TableRow>
        ) : (
          data.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.sort_order}</TableCell>
              <TableCell className='font-medium'>{row.title}</TableCell>
              <TableCell>{row.url}</TableCell>
              <TableCell>{row.icon}</TableCell>
              <TableCell>{row.group?.name}</TableCell>
              <TableCell>{row.roles?.map((r) => ROLE_LABEL[r] || r).join(', ') || '全部'}</TableCell>
              <TableCell>
                <div className='flex gap-2'>
                  <Button variant='ghost' size='icon' onClick={() => { setCurrentRow(row); setOpen(true) }}>
                    <Pencil className='h-4 w-4' />
                  </Button>
                  <Button variant='ghost' size='icon' onClick={() => { setCurrentRow(row); setDeleteOpen(true) }}>
                    <Trash2 className='h-4 w-4 text-destructive' />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
