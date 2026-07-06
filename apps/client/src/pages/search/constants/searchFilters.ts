import type {
  FoodCategoryValue,
  SearchFilterOption,
  SearchSortValue,
} from '@/pages/search/types'

export const RECENT_SEARCH_KEYWORDS_STORAGE_KEY = 'hashi:search:recent-keywords'

export const MAX_RECENT_SEARCH_KEYWORD_COUNT = 10

export const sortOptions = [
  { label: '기본순', value: 'default' },
  { label: '인기순', value: 'popular' },
  { label: '별점순', value: 'rating' },
] satisfies SearchFilterOption<SearchSortValue>[]

export const foodCategoryOptions = [
  { label: '전체', value: 'all' },
  { label: '스시/사시미류', value: 'sushiSashimi' },
  { label: '면류', value: 'noodle' },
  { label: '덮밥류', value: 'riceBowl' },
  { label: '나베/냄비류', value: 'nabe' },
  { label: '튀김류', value: 'fried' },
  { label: '철판/구이류', value: 'teppanGrill' },
  { label: '기타', value: 'etc' },
] satisfies SearchFilterOption<FoodCategoryValue>[]
