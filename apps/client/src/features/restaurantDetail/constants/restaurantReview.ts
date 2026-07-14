import type { ReactNode } from 'react'

export type ReviewSortValue = 'latest' | 'rating-high' | 'rating-low'

export const REVIEW_SORT_OPTIONS = [
  { label: '최신순', value: 'latest' },
  { label: '높은 평점 순', value: 'rating-high' },
  { label: '낮은 평점 순', value: 'rating-low' },
] satisfies {
  label: string
  value: ReviewSortValue
}[]

export const REVIEW_PAGE_SIZE = 10
export const RATING_DISTRIBUTION = [5, 4, 3, 2, 1] as const

export type ReviewKeywordIconMap = Record<string, ReactNode>
