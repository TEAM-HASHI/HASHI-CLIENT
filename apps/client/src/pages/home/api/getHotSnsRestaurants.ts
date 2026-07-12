import { request } from '@/shared/api'
import type { components } from '@/shared/api/generated/openapi'

import type { HotSnsRestaurant } from '@/pages/home/homeContent'

type RestaurantListResponse = components['schemas']['RestaurantListResponse']
type RestaurantSummaryResponse =
  components['schemas']['RestaurantSummaryResponse']

const HOT_SNS_RESTAURANT_SIZE = 5

const mapHotSnsRestaurant = ({
  genre,
  name,
  restaurantId,
  summary,
  thumbnailUrl,
}: RestaurantSummaryResponse): HotSnsRestaurant => {
  const restaurantName = name ?? '이름 없는 식당'

  return {
    imageAlt: `${restaurantName} 대표 이미지`,
    imageUrl: thumbnailUrl ?? undefined,
    name: restaurantName,
    restaurantId: String(restaurantId ?? restaurantName),
    summary: summary ?? genre ?? '',
  }
}

export const getHotSnsRestaurants = async () => {
  const data = await request<RestaurantListResponse>('/api/v1/restaurants', {
    searchParams: {
      size: HOT_SNS_RESTAURANT_SIZE,
      type: 'sns-hot',
    },
  })

  return data?.content?.map(mapHotSnsRestaurant) ?? []
}
