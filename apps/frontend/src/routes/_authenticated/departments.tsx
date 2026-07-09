import { createFileRoute, redirect } from '@tanstack/react-router'
import { Departments } from '@/features/departments'

function requireAdmin() {
  const token = localStorage.getItem('auth_token')
  if (!token) throw redirect({ to: '/sign-in' })
  try {
    const user = JSON.parse(localStorage.getItem('auth_user') || '{}')
    if (user.role !== 'super_admin' && user.role !== 'admin') {
      throw redirect({ to: '/' })
    }
  } catch {
    throw redirect({ to: '/' })
  }
}

export const Route = createFileRoute('/_authenticated/departments')({
  beforeLoad: requireAdmin,
  component: Departments,
})
