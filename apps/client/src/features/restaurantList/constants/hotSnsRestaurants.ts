import type { FilterOption } from '@/features/restaurantList/types'

export const HOT_SNS_RESTAURANTS_SORT_OPTIONS: FilterOption[] = [
  { label: '인기순', value: 'popular' },
  { label: '최신순', value: 'latest' },
  { label: '별점순', value: 'rating' },
]
