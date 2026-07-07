import { createFileRoute } from '@tanstack/react-router'
import { PriceMonitor } from '@/features/price'

export const Route = createFileRoute('/_authenticated/price/monitor')({
  component: PriceMonitor,
})
