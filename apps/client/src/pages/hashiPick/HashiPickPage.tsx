import {
  HASHI_PICK_SORT_OPTIONS,
  RestaurantListPage,
} from '@/features/restaurantList'

export const HashiPickPage = () => {
  return (
    <RestaurantListPage
      restaurantType="hashi-pick"
      sortOptions={HASHI_PICK_SORT_OPTIONS}
      title="하시 Pick"
    />
  )
}
