import { createFileRoute } from '@tanstack/react-router'
import { PlatformCompare } from '@/features/price'

export const Route = createFileRoute('/_authenticated/price/compare')({
  component: PlatformCompare,
})
