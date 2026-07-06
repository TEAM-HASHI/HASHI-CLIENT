import type { FilterOption, Restaurant } from './types'

export const HASHI_PICK_SORT_OPTIONS: FilterOption[] = [
  { label: '기본순', value: 'default' },
  { label: '인기순', value: 'popular' },
  { label: '별점순', value: 'rating' },
]

export const POPULAR_RESTAURANT_SORT_OPTIONS: FilterOption[] = [
  { label: '기본순', value: 'default' },
  { label: '별점순', value: 'rating' },
]

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

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    name: '히마와리 스시 신도심점',
    rating: 4.8,
    region: '도쿄',
    category: '초밥',
    images: [],
    description:
      '식당 소개를 여기 간단하게 한 줄 적어주세요. 식당 소개를 여기 간단하게 한 줄 적어주세요.',
    hashtags: ['#해시태그', '#해시태그', '#해시태그'],
  },
]
