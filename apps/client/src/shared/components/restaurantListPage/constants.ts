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
    hashtags: ['#스시', '#예약가능', '#현지인추천'],
  },
  {
    id: '2',
    name: '멘야 하루',
    rating: 4.6,
    region: '오사카',
    category: '라멘',
    images: [],
    description:
      '깊은 국물과 쫄깃한 면이 좋은 현지 라멘 맛집입니다. 점심 시간 방문을 추천합니다.',
    hashtags: ['#라멘', '#혼밥', '#따뜻한국물'],
  },
  {
    id: '3',
    name: '카츠도라 긴자',
    rating: 4.7,
    region: '도쿄',
    category: '돈카츠',
    images: [],
    description:
      '바삭한 튀김과 부드러운 고기가 잘 어울리는 정식 메뉴가 인기입니다.',
    hashtags: ['#돈카츠', '#정식', '#웨이팅맛집'],
  },
]
