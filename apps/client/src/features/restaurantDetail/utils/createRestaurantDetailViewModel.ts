import type { RestaurantMenuResponse } from '@/features/restaurantDetail/api/getRestaurantMenus'
import type { ReviewSummaryResponse } from '@/features/restaurantDetail/api/getRestaurantReviews'
import type { RestaurantStoreInformation } from '@/features/restaurantDetail/api/getRestaurantStoreInformation'
import type { RestaurantSummary } from '@/features/restaurantDetail/api/getRestaurantSummary'
import type { RestaurantDetail } from '@/features/restaurantDetail/types/restaurantDetail'

const DAY_LABEL_BY_API_DAY = {
  MONDAY: '월',
  TUESDAY: '화',
  WEDNESDAY: '수',
  THURSDAY: '목',
  FRIDAY: '금',
  SATURDAY: '토',
  SUNDAY: '일',
} as const

const API_DAY_BY_DATE_DAY = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const

type BusinessHoursViewModel = RestaurantDetail['businessHours'][number]

const formatNumber = (value: number) => value.toLocaleString('ko-KR')

const formatWon = (value: number) => `${formatNumber(value)}원`

const formatDateLabel = (date: Date) => {
  const day = DAY_LABEL_BY_API_DAY[API_DAY_BY_DATE_DAY[date.getDay()]]

  return `${date.getMonth() + 1}/${date.getDate()} (${day})`
}

const normalizeDayOfWeek = (dayOfWeek: string | undefined) =>
  dayOfWeek?.trim().toUpperCase() as
    | keyof typeof DAY_LABEL_BY_API_DAY
    | undefined

const formatBusinessHours = (
  hours: RestaurantStoreInformation['businessHours'][number],
): BusinessHoursViewModel | null => {
  const dayOfWeek = normalizeDayOfWeek(hours.dayOfWeek)
  const dayLabel = dayOfWeek ? DAY_LABEL_BY_API_DAY[dayOfWeek] : undefined

  if (hours.closed || !hours.openTime || !hours.closeTime) {
    return dayLabel ? { day: dayLabel, hours: '휴무' } : null
  }

  const breakHours =
    hours.breakStart && hours.breakEnd
      ? ` · 브레이크 ${hours.breakStart} - ${hours.breakEnd}`
      : ''

  return dayLabel
    ? {
        day: dayLabel,
        hours: `${hours.openTime} - ${hours.closeTime}${breakHours}`,
      }
    : null
}

const formatBusinessHoursSummary = (
  businessHours: RestaurantStoreInformation['businessHours'],
) => {
  const today = new Date()
  const todayApiDay = API_DAY_BY_DATE_DAY[today.getDay()]
  const todayHours = businessHours.find(
    (hours) => normalizeDayOfWeek(hours.dayOfWeek) === todayApiDay,
  )
  const dateLabel = formatDateLabel(today)

  if (
    !todayHours ||
    todayHours.closed ||
    !todayHours.openTime ||
    !todayHours.closeTime
  ) {
    return `${dateLabel} 휴무`
  }

  return `${dateLabel} ${todayHours.openTime} ~ ${todayHours.closeTime}`
}

const formatLastOrderTime = (
  businessHours: RestaurantStoreInformation['businessHours'],
) => {
  const todayApiDay = API_DAY_BY_DATE_DAY[new Date().getDay()]
  const todayHours = businessHours.find(
    (hours) => normalizeDayOfWeek(hours.dayOfWeek) === todayApiDay,
  )

  return todayHours?.closeTime ?? '영업시간 정보 없음'
}

const formatPriceRange = (
  priceRange: RestaurantStoreInformation['priceRange'],
) => {
  if (!priceRange?.currency || priceRange.minPrice === undefined) {
    return '가격 정보 없음'
  }

  const minPrice = formatNumber(priceRange.minPrice)
  const maxPrice =
    priceRange.maxPrice === undefined ? null : formatNumber(priceRange.maxPrice)

  return maxPrice
    ? `${priceRange.currency} ${minPrice} - ${maxPrice}`
    : `${priceRange.currency} ${minPrice}`
}

const formatReviewDate = (createdAt: string | undefined) => {
  if (!createdAt) {
    return ''
  }

  const date = new Date(createdAt)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}.${month}.${day}`
}

export const createRestaurantMenusViewModel = (
  menus: RestaurantMenuResponse[],
) =>
  menus.flatMap((menu) => {
    if (menu.menuId === undefined || !menu.name) {
      return []
    }

    return {
      id: String(menu.menuId),
      name: menu.name,
      description: menu.description ?? '',
      priceCurrency: menu.currency ?? 'JPY',
      price: menu.price === undefined ? '' : formatNumber(menu.price),
      isRepresentative: menu.main,
      imageUrl: menu.imageUrl,
    }
  })

const createReviews = (reviews: ReviewSummaryResponse[]) =>
  reviews.flatMap((review) => {
    const reviewerName = review.reviewerNickname ?? review.writerNickname

    if (review.reviewId === undefined || !reviewerName) {
      return []
    }

    return {
      id: String(review.reviewId),
      reviewerName,
      reviewerProfileImageUrl:
        review.reviewerProfileImageUrl ?? review.profileImageUrl,
      rating: review.rating ?? 0,
      date: formatReviewDate(review.createdAt),
      content: review.content ?? '',
      images: review.previewImageUrls ?? [],
      keywords: review.keywords ?? [],
    }
  })

interface CreateRestaurantDetailViewModelParams {
  summary: RestaurantSummary
  storeInformation: RestaurantStoreInformation
  menus: RestaurantMenuResponse[]
  reviews: ReviewSummaryResponse[]
  averageRating: number
  reviewCount: number
}

export const createRestaurantDetailViewModel = ({
  summary,
  storeInformation,
  menus,
  reviews,
  averageRating,
  reviewCount,
}: CreateRestaurantDetailViewModelParams): RestaurantDetail => {
  const businessHours = storeInformation.businessHours.reduce<
    RestaurantDetail['businessHours']
  >((acc, hours) => {
    const formattedHours = formatBusinessHours(hours)

    if (formattedHours) {
      acc.push(formattedHours)
    }

    return acc
  }, [])

  return {
    id: String(summary.restaurantId),
    name: summary.name,
    localName: summary.localName ?? '',
    rating: averageRating || (summary.rating ?? 0),
    reviewCount: reviewCount || (summary.reviewCount ?? 0),
    likeCount: '0',
    summary: summary.summary ?? '',
    address: summary.address,
    businessHoursSummary: formatBusinessHoursSummary(
      storeInformation.businessHours,
    ),
    deposit: formatWon(summary.reservationFee),
    detailDescription: storeInformation.description ?? summary.summary ?? '',
    lastOrderTime: formatLastOrderTime(storeInformation.businessHours),
    businessHours,
    priceRange: formatPriceRange(storeInformation.priceRange),
    heroImages: summary.imageUrls,
    menus: createRestaurantMenusViewModel(menus),
    reviews: createReviews(reviews),
  }
}
