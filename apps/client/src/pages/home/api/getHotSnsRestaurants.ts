import {
  getRestaurants,
  type RestaurantSummaryResponse,
} from '@/features/restaurantList/api/getRestaurants'
import type { HotSnsRestaurant } from '@/pages/home/homeContent'

const HOT_SNS_RESTAURANT_SIZE = 5

const mapHotSnsRestaurant = ({
  genre,
  name,
  restaurantId,
  summary,
  thumbnailUrl,
}: RestaurantSummaryResponse): HotSnsRestaurant | null => {
  if (restaurantId === undefined) {
    return null
  }

  const restaurantName = name ?? '이름 없는 식당'

  return {
    imageAlt: `${restaurantName} 대표 이미지`,
    imageUrl: thumbnailUrl ?? undefined,
    name: restaurantName,
    restaurantId: String(restaurantId),
    summary: summary ?? genre ?? '',
  }
}

export const getHotSnsRestaurants = async () => {
  const { restaurants } = await getRestaurants({
    size: HOT_SNS_RESTAURANT_SIZE,
    type: 'sns-hot',
  })

  return restaurants.flatMap((restaurant) => {
    const hotSnsRestaurant = mapHotSnsRestaurant(restaurant)

    return hotSnsRestaurant ? [hotSnsRestaurant] : []
  })
}
