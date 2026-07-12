export const GENRE_OPTIONS = [
  { value: 'sushi', label: '스시' },
  { value: 'noodle', label: '면' },
  { value: 'rice-bowl', label: '덮밥' },
  { value: 'nabe', label: '나베' },
  { value: 'fried', label: '튀김' },
  { value: 'grill', label: '구이' },
  { value: 'etc', label: '기타' },
] as const

export const FOOD_CATEGORY_OPTIONS = GENRE_OPTIONS

export const CURRENCY_OPTIONS = [
  { value: 'JPY', label: '일본 엔 (JPY)' },
  { value: 'KRW', label: '대한민국 원 (KRW)' },
  { value: 'USD', label: '미국 달러 (USD)' },
] as const

export const CURATION_OPTIONS = [
  { value: 'sns-hot', label: 'SNS 인기' },
  { value: 'popular', label: '인기 식당' },
  { value: 'hashi-pick', label: '하시 픽' },
  { value: 'today-restaurant', label: '오늘의 식당' },
] as const
