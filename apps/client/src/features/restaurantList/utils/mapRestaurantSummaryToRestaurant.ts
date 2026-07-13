import type { RestaurantSummaryResponse } from '@/features/restaurantList/api/getRestaurants'
import type { Restaurant } from '@/features/restaurantList/types'

const categoryLabelByValue: Record<string, string> = {
  all: '전체',
  etc: '기타',
  fried: '튀김류',
  grill: '철판/구이류',
  nabe: '나베/냄비류',
  noodle: '면류',
  'rice-bowl': '덮밥류',
  riceBowl: '덮밥류',
  sushi: '스시/사시미류',
}

const getCategoryLabel = ({
  foodCategory,
  genre,
}: RestaurantSummaryResponse) => {
  const category = foodCategory ?? genre

  if (!category) {
    return ''
  }

  return categoryLabelByValue[category] ?? category
}

const getRestaurantImages = ({
  imageUrls,
  thumbnailUrl,
}: RestaurantSummaryResponse) => {
  if (imageUrls && imageUrls.length > 0) {
    return imageUrls
  }

  return thumbnailUrl ? [thumbnailUrl] : []
}

const getHashTags = ({ hashtags }: RestaurantSummaryResponse) => {
  return (hashtags ?? []).map((hashtag) =>
    hashtag.startsWith('#') ? hashtag : `#${hashtag}`,
  )
}

export const mapRestaurantSummaryToRestaurant = (
  restaurant: RestaurantSummaryResponse,
): Restaurant | null => {
  if (restaurant.restaurantId === undefined) {
    return null
  }

  return {
    category: getCategoryLabel(restaurant),
    description: restaurant.summary ?? '',
    hashtags: getHashTags(restaurant),
    id: String(restaurant.restaurantId),
    images: getRestaurantImages(restaurant),
    name: restaurant.name ?? '이름 없는 식당',
    rating: restaurant.rating ?? 0,
    region: restaurant.area ?? '',
  }
}
