import { RestaurantResultItem } from '@/pages/search/components/RestaurantResultItem'
import type { SearchRestaurant } from '@/pages/search/types'

interface RestaurantResultListProps {
  restaurants: SearchRestaurant[]
}

export const RestaurantResultList = ({
  restaurants,
}: RestaurantResultListProps) => {
  return (
    <ul className="flex flex-col gap-[30px] px-5 pt-[30px] pb-[30px]">
      {restaurants.map((restaurant) => (
        <RestaurantResultItem key={restaurant.id} restaurant={restaurant} />
      ))}
    </ul>
  )
}
