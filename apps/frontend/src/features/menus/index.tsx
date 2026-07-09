import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { SearchIcon, RotateCcw, Loader2 } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import { MenusProvider } from './components/menus-provider'
import { MenusPrimaryButtons } from './components/menus-primary-buttons'
import { MenusTable } from './components/menus-table'
import { MenusDialogs } from './components/menus-dialogs'
import { fetchMenusAPI } from './api'

export function Menus() {
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [keywordInput, setKeywordInput] = useState('')
  const [queryKeyword, setQueryKeyword] = useState('')

  const handleSearch = () => {
    setQueryKeyword(keywordInput)
    setPage(1)
  }
  const handleReset = () => {
    setKeywordInput('')
    setQueryKeyword('')
    setPage(1)
  }

  const { data: menusRes, isLoading } = useQuery({
    queryKey: ['menus', page, queryKeyword],
    queryFn: () => fetchMenusAPI({
      page,
      pageSize,
      keyword: queryKeyword || undefined,
    }),
  })
  const items = menusRes?.items ?? []
  const total = menusRes?.total ?? 0

  return (
    <MenusProvider>
      <Header fixed>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>菜单管理</h2>
          <p className='text-muted-foreground'>管理侧边栏导航菜单，仅管理员可访问。</p>
        </div>
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div />
          <MenusPrimaryButtons />
        </div>
        <Card>
          <CardHeader className='pb-3'>
            <div className='flex items-end gap-4 flex-wrap'>
              <div className='flex items-center gap-2'>
                <Input
                  placeholder='搜索菜单名称或路径'
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  className='w-56'
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}><SearchIcon className='mr-1 h-4 w-4' />搜索</Button>
              <Button variant='outline' onClick={handleReset}><RotateCcw className='mr-1 h-4 w-4' />重置</Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='flex items-center justify-center py-8 text-muted-foreground'>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />加载中...
              </div>
            ) : (
              <MenusTable data={[...items].sort((a, b) => a.sort_order - b.sort_order)} />
            )}
            {!isLoading && (
              <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
            )}
          </CardContent>
        </Card>
      </Main>
      <MenusDialogs />
    </MenusProvider>
  )
}
