import { createFileRoute } from '@tanstack/react-router'
import { HistoryPriceQuery } from '@/features/history-price'

export const Route = createFileRoute('/_authenticated/history-price')({
  component: HistoryPriceQuery,
})
