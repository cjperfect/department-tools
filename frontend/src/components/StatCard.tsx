import { type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: 'up' | 'down'
  className?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className='p-4'>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium text-muted-foreground'>
            {title}
          </span>
          <Icon className='size-4 text-muted-foreground' />
        </div>
        <div className='mt-1 text-xl font-bold'>{value}</div>
        {description && (
          <p
            className={cn(
              'mt-1 text-xs',
              trend === 'up' && 'text-green-600 dark:text-green-400',
              trend === 'down' && 'text-red-600 dark:text-red-400',
              !trend && 'text-muted-foreground'
            )}
          >
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
