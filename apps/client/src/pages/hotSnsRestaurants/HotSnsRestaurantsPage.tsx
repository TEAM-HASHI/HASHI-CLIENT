import {
  HOT_SNS_RESTAURANTS_SORT_OPTIONS,
  RestaurantListTemplate,
} from '@/features/restaurantList'

export const HotSnsRestaurantsPage = () => (
  <RestaurantListTemplate
    filterMode="inline-sort"
    restaurantType="sns-hot"
    sortOptions={HOT_SNS_RESTAURANTS_SORT_OPTIONS}
    title="SNS 맛집 리스트"
  />
)
