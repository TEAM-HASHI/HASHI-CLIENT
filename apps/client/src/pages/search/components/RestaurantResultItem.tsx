import { ClockSmallIcon, StarFillIcon } from '@hashi/hds-icons'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import type { SearchRestaurant } from '@/pages/search/types'

interface RestaurantResultItemProps {
  restaurant: SearchRestaurant
}

const createRestaurantDetailPath = (restaurantId: string) => {
  return ROUTES.restaurantDetail.replace(':restaurantId', restaurantId)
}

export const RestaurantResultItem = ({
  restaurant,
}: RestaurantResultItemProps) => {
  return (
    <li>
      <Link
        className="flex gap-3"
        to={createRestaurantDetailPath(restaurant.id)}
      >
        {restaurant.imageUrl ? (
          <img
            alt=""
            className="h-[92px] w-[92px] shrink-0 rounded-[5px] object-cover"
            src={restaurant.imageUrl}
          />
        ) : (
          <div
            aria-hidden="true"
            className="from-cool-gray-100 to-warm-gray-50 h-[92px] w-[92px] shrink-0 rounded-[5px] bg-linear-to-br"
          />
        )}
        <div className="min-w-0 flex-1 self-center">
          <h3 className="typo-sub-header-2 text-cool-gray-900 line-clamp-2">
            {restaurant.name}
          </h3>
          <div className="mt-2 flex items-center gap-1">
            <StarFillIcon
              aria-hidden="true"
              className="text-primary-400 size-4 shrink-0"
            />
            <span className="typo-body-4 text-black">
              {restaurant.rating.toFixed(1)}
            </span>
            <span className="typo-body-6 text-point-300">
              # {restaurant.tag}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5">
            <ClockSmallIcon
              aria-hidden="true"
              className="text-cool-gray-900 size-4 shrink-0"
            />
            <span className="typo-body-7 text-primary-200 min-w-0 truncate">
              {restaurant.businessHours}
            </span>
          </div>
        </div>
      </Link>
    </li>
  )
}
