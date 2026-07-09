import { createFileRoute } from '@tanstack/react-router'
import { PriceTrend } from '@/features/price'

export const Route = createFileRoute('/_authenticated/price/trend')({
  component: PriceTrend,
})
