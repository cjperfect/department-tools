type AuthLayoutProps = { children: React.ReactNode }

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='flex min-h-svh items-center justify-center px-4'>
      <div className='flex w-full max-w-md flex-col items-center justify-center space-y-4 py-8'>
        <div className='flex items-center justify-center'>
          <h1 className='text-xl font-medium'>部门业务工具</h1>
        </div>
        {children}
      </div>
    </div>
  )
}
