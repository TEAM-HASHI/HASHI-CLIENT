import type { ReviewKeywordId } from '@/features/review/constants'

export interface ReviewDetailImage {
  id: string
  src: string
  alt: string
}

export interface ReviewDetail {
  id: string
  restaurantName: string
  visitedAt: string
  guestSummary: string
  thumbnailSrc?: string
  rating: number
  writtenDate: string
  content: string
  images: ReviewDetailImage[]
  keywordIds: ReviewKeywordId[]
}
