import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTableRowActions } from './data-table-row-actions'
import type { User } from '../data/schema'
import { roles } from '../data/data'

export const usersColumns: ColumnDef<User>[] = [
  {
    accessorKey: 'username',
    header: '用户名',
    cell: ({ row }) => <span className='font-medium'>{row.getValue('username')}</span>,
  },
  {
    accessorKey: 'employee_id',
    header: '工号',
    cell: ({ row }) => row.getValue('employee_id') || '-',
  },
  {
    accessorKey: 'department',
    header: '部门',
    cell: ({ row }) => {
      const user = row.original as any
      return user.department?.name || '-'
    },
  },
  {
    accessorKey: 'role',
    header: '角色',
    cell: ({ row }) => {
      const r = roles.find((r) => r.value === row.getValue('role'))
      return <Badge variant='outline'>{r?.label || row.getValue('role')}</Badge>
    },
  },
  {
    accessorKey: 'status',
    header: '状态',
    cell: ({ row }) => {
      const s = row.getValue('status') as string
      return <Badge variant={s === 'active' ? 'outline' : 'destructive'}>{s === 'active' ? '启用' : '禁用'}</Badge>
    },
  },
  {
    accessorKey: 'created_at',
    header: '创建时间',
    cell: ({ row }) => {
      const v = row.getValue('created_at') as string
      return v ? new Date(v).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'
    },
  },
  {
    id: 'actions',
    header: '操作',
    cell: DataTableRowActions,
  },
]
