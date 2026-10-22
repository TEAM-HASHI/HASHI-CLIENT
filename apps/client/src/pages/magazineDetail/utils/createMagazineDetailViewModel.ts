import type { MagazineDetailResponse } from '@/pages/magazineDetail/api/magazineDetailApi'
import type { MagazineDetail } from '@/pages/magazineDetail/types'
import { mapRestaurantSummaryToRestaurant } from '@/features/restaurantList/utils/mapRestaurantSummaryToRestaurant'

export const createMagazineDetailViewModel = (
  data: MagazineDetailResponse,
): MagazineDetail => ({
  title: data.title,
  coverImageUrls: data.cardNewsImages?.length
    ? [...data.cardNewsImages]
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        .map(({ image, legacyUrl }) =>
          image
            ? image.status === 'READY'
              ? (image.defaultSource?.url ?? null)
              : null
            : (legacyUrl ?? null),
        )
    : data.cardNewsImageUrls,
  content: data.content ?? '',
  hashtag: data.hashtags
    .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))
    .join(' '),
  publishedAt: Number.isFinite(Date.parse(data.createdAt))
    ? data.createdAt.slice(0, 16).replaceAll('-', '.').replace('T', ' ')
    : '',
  likeCount: data.likeCount,
  restaurants: data.restaurants.flatMap((restaurant) => {
    const restaurantId = restaurant.restaurantId
    if (
      typeof restaurantId !== 'number' ||
      !Number.isSafeInteger(restaurantId) ||
      restaurantId <= 0
    )
      return []
    const summary = mapRestaurantSummaryToRestaurant({
      restaurantId,
      name: restaurant.name,
      rating: restaurant.rating ?? undefined,
      area: restaurant.area ?? undefined,
      foodCategory: restaurant.foodCategory ?? undefined,
    })!
    const hours = restaurant.todayBusinessHour
    const price = restaurant.priceRange
    const bounds = [price?.minPrice, price?.maxPrice].filter(
      (value): value is number => value != null,
    )
    return [
      {
        id: summary.id,
        name: summary.name,
        rating: summary.rating,
        region: summary.region,
        category: summary.category,
        imageUrls: restaurant.imageUrls ?? [],
        openingHours: !hours
          ? '영업시간 정보 없음'
          : hours.closed
            ? '오늘 휴무'
            : hours.openTime && hours.closeTime
              ? `오늘 · ${hours.openTime.slice(0, 5)}~${hours.closeTime.slice(0, 5)}`
              : '영업시간 정보 없음',
        priceRange:
          price?.currency && bounds.length
            ? `${price.currency} ${bounds.map((value) => value.toLocaleString('ko-KR')).join('~')}`
            : '가격 정보 없음',
      },
    ]
  }),
})
