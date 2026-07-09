import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDepartments } from './departments-provider'
import type { Department } from '../api'

export function DepartmentsTable({ data }: { data: Department[] }) {
  const { setOpen, setCurrentRow, setDeleteOpen } = useDepartments()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>序号</TableHead>
          <TableHead>部门名称</TableHead>
          <TableHead>创建时间</TableHead>
          <TableHead className='w-24'>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className='text-center text-muted-foreground'>
              暂无数据
            </TableCell>
          </TableRow>
        ) : (
          data.map((row, index) => (
            <TableRow key={row.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell className='font-medium'>{row.name}</TableCell>
              <TableCell>
                {new Date(row.created_at).toLocaleString('zh-CN')}
              </TableCell>
              <TableCell>
                <div className='flex gap-2'>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => {
                      setCurrentRow({ id: row.id, name: row.name })
                      setOpen(true)
                    }}
                  >
                    <Pencil className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => {
                      setCurrentRow({ id: row.id, name: row.name })
                      setDeleteOpen(true)
                    }}
                  >
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
