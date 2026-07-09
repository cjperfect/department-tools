import { Button } from '@/components/ui/button'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  return (
    <div className='flex items-center justify-between mt-4'>
      <span className='text-sm text-muted-foreground'>共 {total} 条</span>
      <div className='flex gap-1'>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Button key={p} size='sm' variant={p === page ? 'default' : 'outline'} onClick={() => onPageChange(p)}>
            {p}
          </Button>
        ))}
      </div>
    </div>
  )
}
