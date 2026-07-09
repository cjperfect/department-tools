import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useDepartments } from './departments-provider'

export function DepartmentsPrimaryButtons() {
  const { setOpen, setCurrentRow } = useDepartments()

  return (
    <Button
      onClick={() => {
        setCurrentRow(null)
        setOpen(true)
      }}
    >
      <Plus className='mr-1 h-4 w-4' />
      新增部门
    </Button>
  )
}
