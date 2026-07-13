import type { FilterOption } from '@/features/restaurantList/types'

export const HASHI_PICK_SORT_OPTIONS: FilterOption[] = [
  { label: '기본순', value: 'default' },
  { label: '인기순', value: 'popular' },
  { label: '별점순', value: 'rating' },
]
