import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Card, CardContent } from '@/components/ui/card'
import { DepartmentsProvider } from './components/departments-provider'
import { DepartmentsPrimaryButtons } from './components/departments-primary-buttons'
import { DepartmentsTable } from './components/departments-table'
import { DepartmentsDialogs } from './components/departments-dialogs'
import { fetchDepartments } from './api'

export function Departments() {
  const { data: items, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
  })

  return (
    <DepartmentsProvider>
      <Header fixed>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>部门管理</h2>
          <p className='text-muted-foreground'>管理系统中的组织部门，仅管理员可访问。</p>
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div />
          <DepartmentsPrimaryButtons />
        </div>

        <Card>
          <CardContent className='pt-6'>
            {isLoading ? (
              <div className='flex items-center justify-center py-8 text-muted-foreground'>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                加载中...
              </div>
            ) : (
              <DepartmentsTable data={items ?? []} />
            )}
          </CardContent>
        </Card>
      </Main>

      <DepartmentsDialogs />
    </DepartmentsProvider>
  )
}
