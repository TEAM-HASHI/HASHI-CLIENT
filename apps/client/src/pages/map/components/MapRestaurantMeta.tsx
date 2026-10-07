import { ClockSmallIcon, MoneySmallIcon, StarFillIcon } from '@hashi/hds-icons'

import type { MapRestaurant } from '@/pages/map/types'

export const MapRestaurantMeta = ({
  restaurant,
}: {
  restaurant: MapRestaurant
}) => (
  <div className="text-primary-200">
    <div className="flex h-6 items-center gap-1">
      <span className="typo-body-3 flex items-center">
        <StarFillIcon
          aria-hidden="true"
          className="text-primary-400 size-4.5"
        />
        {restaurant.rating.toFixed(1)}
      </span>
      <span className="typo-body-7">도쿄 · {restaurant.cuisine}</span>
    </div>
    <div className="typo-body-7 mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1">
      <span className="flex items-center gap-1">
        <ClockSmallIcon aria-hidden="true" className="size-4 shrink-0" />
        {restaurant.hours}
      </span>
      <span className="flex items-center gap-1">
        <MoneySmallIcon aria-hidden="true" className="size-4 shrink-0" />
        {restaurant.price}
      </span>
    </div>
  </div>
)
