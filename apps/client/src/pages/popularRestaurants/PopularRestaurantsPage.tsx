import {
  MOCK_RESTAURANTS,
  POPULAR_RESTAURANT_SORT_OPTIONS,
  RestaurantListPage,
} from '@/features/restaurantList'

export const PopularRestaurantsPage = () => {
  return (
    <RestaurantListPage
      restaurants={MOCK_RESTAURANTS}
      sortOptions={POPULAR_RESTAURANT_SORT_OPTIONS}
      title="인기 맛집"
    />
  )
}
