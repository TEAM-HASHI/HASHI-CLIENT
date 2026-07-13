import type { RestaurantSummaryResponse } from '@/features/restaurantList/api/getRestaurants'
import type { FoodCategoryValue, SearchRestaurant } from '@/pages/search/types'

const foodCategoryValues = [
  'all',
  'sushiSashimi',
  'noodle',
  'riceBowl',
  'nabe',
  'fried',
  'teppanGrill',
  'etc',
] as const

const genreCategoryMap = {
  기타: 'etc',
  '나베/냄비류': 'nabe',
  덮밥류: 'riceBowl',
  면류: 'noodle',
  '스시/사시미류': 'sushiSashimi',
  '철판/구이류': 'teppanGrill',
  튀김류: 'fried',
} satisfies Record<string, FoodCategoryValue>

const checkIsGenreCategory = (
  genre: string,
): genre is keyof typeof genreCategoryMap => {
  return Object.hasOwn(genreCategoryMap, genre)
}

const checkIsFoodCategoryValue = (value: string): value is FoodCategoryValue =>
  foodCategoryValues.some((categoryValue) => categoryValue === value)

const getRestaurantCategory = (
  genre: RestaurantSummaryResponse['genre'],
): FoodCategoryValue => {
  if (genre && checkIsGenreCategory(genre)) {
    return genreCategoryMap[genre]
  }

  if (genre && checkIsFoodCategoryValue(genre)) {
    return genre
  }

  return 'etc'
}

const getRestaurantTag = (restaurant: RestaurantSummaryResponse) => {
  return restaurant.hashtags?.[0] ?? restaurant.genre ?? restaurant.area ?? ''
}

const dayOfWeekLabelMap: Record<string, string> = {
  FRIDAY: '금',
  MONDAY: '월',
  SATURDAY: '토',
  SUNDAY: '일',
  THURSDAY: '목',
  TUESDAY: '화',
  WEDNESDAY: '수',
}

const getDateLabel = ({
  date,
  dayOfWeek,
}: NonNullable<RestaurantSummaryResponse['todayBusinessHour']>) => {
  const [, month, day] = date?.split('-') ?? []
  const dayOfWeekLabel = dayOfWeek ? dayOfWeekLabelMap[dayOfWeek] : undefined

  if (month && day && dayOfWeekLabel) {
    return `${Number(month)}/${Number(day)} (${dayOfWeekLabel})`
  }

  return undefined
}

const getRestaurantBusinessHours = ({
  todayBusinessHour,
}: RestaurantSummaryResponse) => {
  if (!todayBusinessHour) {
    return '영업시간 확인 필요'
  }

  const dateLabel = getDateLabel(todayBusinessHour)

  if (todayBusinessHour.closed) {
    return dateLabel ? `${dateLabel} 휴무` : '휴무'
  }

  if (todayBusinessHour.openTime && todayBusinessHour.closeTime) {
    const timeLabel = `${todayBusinessHour.openTime}~${todayBusinessHour.closeTime}`

    return dateLabel ? `${dateLabel} ${timeLabel}` : timeLabel
  }

  return '영업시간 확인 필요'
}

export const mapSearchRestaurant = (
  restaurant: RestaurantSummaryResponse,
): SearchRestaurant | null => {
  if (restaurant.restaurantId === undefined) {
    return null
  }

  const name = restaurant.name ?? '이름 없는 식당'
  const genre = restaurant.genre ?? ''
  const tag = getRestaurantTag(restaurant)

  return {
    businessHours: getRestaurantBusinessHours(restaurant),
    category: getRestaurantCategory(restaurant.genre),
    id: String(restaurant.restaurantId),
    imageUrl: restaurant.thumbnailUrl ?? undefined,
    keywords: [
      name,
      genre,
      restaurant.foodCategory ?? '',
      restaurant.summary ?? '',
      ...(restaurant.hashtags ?? []),
    ].filter(Boolean),
    name,
    popularity: 0,
    rating: restaurant.rating ?? 0,
    tag,
  }
}
