import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/StatusBadge'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { MonitorForm, type MonitorFormData } from './MonitorForm'
import {
  getMonitorList,
  addMonitor,
  deleteMonitor,
  type MonitorItem,
} from '@/api/price'
import { toast } from 'sonner'

export function MonitorTable() {
  const [items, setItems] = useState<MonitorItem[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const deleteTarget = items.find((i) => i.id === deleteId)

  // 初始加载
  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      const data = await getMonitorList()
      setItems(data)
    } catch {
      toast.error('加载监控列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (formData: MonitorFormData) => {
    try {
      const newItem = await addMonitor({
        url: formData.url,
        targetPrice: formData.targetPrice,
      })
      setItems((prev) => [newItem, ...prev])
      toast.success(`已添加「${newItem.name}」监控`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '添加失败')
    }
  }

  const handleDeleteConfirm = async () => {
    if (deleteId === null) return
    try {
      await deleteMonitor(deleteId)
      setItems((prev) => prev.filter((i) => i.id !== deleteId))
      setDeleteId(null)
      toast.success('已删除监控')
    } catch {
      toast.error('删除失败')
    }
  }

  return (
    <>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>监控列表</CardTitle>
          <Button size='sm' onClick={() => setFormOpen(true)}>
            <Plus className='mr-1 size-4' />
            添加监控
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='py-12 text-center text-muted-foreground'>
              加载中...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>商品名称</TableHead>
                  <TableHead>平台</TableHead>
                  <TableHead>当前价格</TableHead>
                  <TableHead>目标价格</TableHead>
                  <TableHead>差价</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className='font-medium'>{item.name}</TableCell>
                    <TableCell>
                      <Badge variant='secondary'>{item.platform}</Badge>
                    </TableCell>
                    <TableCell>¥{item.currentPrice.toLocaleString()}</TableCell>
                    <TableCell>¥{item.targetPrice.toLocaleString()}</TableCell>
                    <TableCell
                      className={
                        item.diff < 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {item.diff > 0 ? '+' : ''}
                      ¥{item.diff.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={item.status}
                        variant={item.status === '已触发' ? 'success' : 'info'}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950'
                        onClick={() => setDeleteId(item.id)}
                      >
                        <Trash2 className='size-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className='py-12 text-center text-muted-foreground'>
                      暂无监控商品，点击「添加监控」开始
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null)
        }}
        title='确认删除'
        desc={
          <>
            确定要删除监控商品「<strong>{deleteTarget?.name}</strong>」吗？
            <br />
            此操作不可撤销。
          </>
        }
        confirmText='删除'
        cancelBtnText='取消'
        destructive
        handleConfirm={handleDeleteConfirm}
      />
      <MonitorForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleAdd}
      />
    </>
  )
}
