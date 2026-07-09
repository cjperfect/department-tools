import { createContext, useContext, useState, type ReactNode } from 'react'

interface DepartmentsContextType {
  open: boolean
  setOpen: (open: boolean) => void
  currentRow: { id: number; name: string } | null
  setCurrentRow: (row: { id: number; name: string } | null) => void
  deleteOpen: boolean
  setDeleteOpen: (open: boolean) => void
}

const DepartmentsContext = createContext<DepartmentsContextType | null>(null)

export function DepartmentsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState<{ id: number; name: string } | null>(null)

  return (
    <DepartmentsContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow, deleteOpen, setDeleteOpen }}
    >
      {children}
    </DepartmentsContext.Provider>
  )
}

export function useDepartments() {
  const ctx = useContext(DepartmentsContext)
  if (!ctx) throw new Error('useDepartments must be used within DepartmentsProvider')
  return ctx
}
