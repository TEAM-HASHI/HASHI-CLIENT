import { CalendarIcon } from '@hashi/hds-icons'

import { MagazineRestaurantCard } from '@/pages/magazineDetail/components/MagazineRestaurantCard'
import type { MagazineDetailRestaurant } from '@/pages/magazineDetail/types'

interface MagazineRestaurantSectionProps {
  restaurants: MagazineDetailRestaurant[]
}

export const MagazineRestaurantSection = ({
  restaurants,
}: MagazineRestaurantSectionProps) => {
  if (restaurants.length === 0) {
    return null
  }

  return (
    <section
      aria-labelledby="magazine-restaurants-title"
      className="px-5 pb-5.5"
    >
      <h2
        className="typo-header-3 text-cool-gray-900 flex items-center gap-1 pt-5"
        id="magazine-restaurants-title"
      >
        <CalendarIcon aria-hidden="true" className="size-6 shrink-0" />
        <span>
          매거진 속 식당을 <span className="text-primary-400">예약</span>
          해보세요!
        </span>
      </h2>
      {restaurants.map((restaurant) => (
        <MagazineRestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </section>
  )
}
