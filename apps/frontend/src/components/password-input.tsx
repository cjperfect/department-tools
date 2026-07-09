import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input, type InputProps } from '@/components/ui/input'

const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const [show, setShow] = useState(false)

    return (
      <div className='relative'>
        <Input
          type={show ? 'text' : 'password'}
          className={cn('pr-10', className)}
          ref={ref}
          {...props}
        />
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
          onClick={() => setShow(!show)}
          tabIndex={-1}
        >
          {show ? (
            <EyeOff className='size-4 text-muted-foreground' />
          ) : (
            <Eye className='size-4 text-muted-foreground' />
          )}
        </Button>
      </div>
    )
  }
)
PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }
