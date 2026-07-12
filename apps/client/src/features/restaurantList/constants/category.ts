import type { FilterOption } from '@/features/restaurantList/types'

export const CATEGORY_OPTIONS: FilterOption[] = [
  { label: '전체', value: 'all' },
  { label: '스시/사시미류', value: 'sushi' },
  { label: '면류', value: 'noodle' },
  { label: '덮밥류', value: 'riceBowl' },
  { label: '나베/냄비류', value: 'nabe' },
  { label: '튀김류', value: 'fried' },
  { label: '철판/구이류', value: 'grill' },
  { label: '기타', value: 'etc' },
]

export const DEFAULT_CATEGORY_OPTION = CATEGORY_OPTIONS[0]
