import {
  POPULAR_RESTAURANTS_SORT_OPTIONS,
  RestaurantListPage,
} from '@/features/restaurantList'

export const PopularRestaurantsPage = () => {
  return (
    <RestaurantListPage
      restaurantType="popular"
      sortOptions={POPULAR_RESTAURANTS_SORT_OPTIONS}
      title="인기 맛집"
    />
  )
}
