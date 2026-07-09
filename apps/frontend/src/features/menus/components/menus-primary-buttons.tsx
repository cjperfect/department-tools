import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useMenus } from './menus-provider'

export function MenusPrimaryButtons() {
  const { setOpen, setCurrentRow } = useMenus()

  return (
    <Button
      onClick={() => {
        setCurrentRow(null)
        setOpen(true)
      }}
    >
      <Plus className='mr-1 h-4 w-4' />
      新增菜单
    </Button>
  )
}
