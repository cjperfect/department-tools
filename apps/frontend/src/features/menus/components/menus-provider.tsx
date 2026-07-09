import { createContext, useContext, useState, type ReactNode } from 'react'

interface MenusContextType {
  open: boolean
  setOpen: (open: boolean) => void
  currentRow: { id: number; title: string; url: string; icon: string; group_name: string; roles: string; sort_order: number } | null
  setCurrentRow: (row: any) => void
  deleteOpen: boolean
  setDeleteOpen: (open: boolean) => void
}

const MenusContext = createContext<MenusContextType | null>(null)

export function MenusProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState<any>(null)

  return (
    <MenusContext.Provider value={{ open, setOpen, currentRow, setCurrentRow, deleteOpen, setDeleteOpen }}>
      {children}
    </MenusContext.Provider>
  )
}

export function useMenus() {
  const ctx = useContext(MenusContext)
  if (!ctx) throw new Error('useMenus must be used within MenusProvider')
  return ctx
}
