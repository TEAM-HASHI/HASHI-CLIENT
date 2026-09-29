import {
  POPULAR_RESTAURANTS_SORT_OPTIONS,
  RestaurantListTemplate,
} from '@/features/restaurantList'

export const PopularRestaurantsPage = () => {
  return (
    <RestaurantListTemplate
      restaurantType="popular"
      sortOptions={POPULAR_RESTAURANTS_SORT_OPTIONS}
      title="인기 맛집"
    />
  )
}
