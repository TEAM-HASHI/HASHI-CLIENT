import {
  HASHI_PICK_SORT_OPTIONS,
  MOCK_RESTAURANTS,
  RestaurantListPage,
} from '@/shared/components/restaurantListPage'

export const HashiPickPage = () => {
  return (
    <RestaurantListPage
      restaurants={MOCK_RESTAURANTS}
      sortOptions={HASHI_PICK_SORT_OPTIONS}
      title="하시 Pick"
    />
  )
}
