import {
  HASHI_PICK_SORT_OPTIONS,
  RestaurantListTemplate,
} from '@/features/restaurantList'

export const HashiPickPage = () => {
  return (
    <RestaurantListTemplate
      restaurantType="hashi-pick"
      sortOptions={HASHI_PICK_SORT_OPTIONS}
      title="하시 Pick"
    />
  )
}
