import { createFileRoute } from '@tanstack/react-router'
import { BiddingAnalysis } from '@/features/bidding'

export const Route = createFileRoute('/_authenticated/bidding')({
  component: BiddingAnalysis,
})
