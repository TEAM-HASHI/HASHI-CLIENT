export const GENRE_OPTIONS = [
  { value: 'sushi', label: '스시/사시미류' },
  { value: 'noodle', label: '면류' },
  { value: 'rice-bowl', label: '덮밥류' },
  { value: 'nabe', label: '나베/냄비류' },
  { value: 'fried', label: '튀김류' },
  { value: 'grill', label: '철판/구이류' },
  { value: 'etc', label: '기타' },
] as const

export const FOOD_CATEGORY_OPTIONS = [
  { value: 'sushi', label: '초밥' },
  { value: 'noodle', label: '면류' },
  { value: 'rice-bowl', label: '덮밥류' },
  { value: 'nabe', label: '나베/냄비류' },
  { value: 'fried', label: '튀김류' },
  { value: 'grill', label: '철판/구이류' },
  { value: 'etc', label: '기타' },
] as const

const normalizeOptionValue = (
  value: string | null | undefined,
  options: readonly { value: string; label: string }[],
) => {
  const normalizedValue = value?.trim()
  if (!normalizedValue) return ''

  return (
    options.find(
      (option) =>
        option.value === normalizedValue || option.label === normalizedValue,
    )?.value ?? ''
  )
}

export const normalizeRestaurantGenre = (value?: string | null) =>
  normalizeOptionValue(value, GENRE_OPTIONS)

export const normalizeRestaurantFoodCategory = (value?: string | null) =>
  normalizeOptionValue(value, FOOD_CATEGORY_OPTIONS)

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
