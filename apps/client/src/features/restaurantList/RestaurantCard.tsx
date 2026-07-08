import { StarFillIcon } from '@hashi/hds-icons'

import type { Restaurant } from './types'
import { RestaurantImageList } from './RestaurantImageList'

type RestaurantCardProps = {
  restaurant: Restaurant
  onClick: (restaurantId: string) => void
}

export const RestaurantCard = ({
  restaurant,
  onClick,
}: RestaurantCardProps) => {
  const handleClickRestaurant = () => {
    onClick(restaurant.id)
  }

  return (
    <li className="border-warm-gray-50 h-[300px] w-full border-b">
      <button
        className="flex h-full w-full flex-col pt-[19px] text-left"
        onClick={handleClickRestaurant}
        type="button"
      >
        <span className="typo-body-3 text-cool-gray-900 line-clamp-1 h-[19px]">
          {restaurant.name}
        </span>
        <span className="text-primary-200 mt-1 flex h-5 items-center">
          <StarFillIcon
            aria-hidden="true"
            className="text-primary-400 size-[18px] shrink-0"
          />
          <span className="typo-body-3 ml-px">{restaurant.rating}</span>
          <span className="typo-body-7 ml-[5px]">
            {restaurant.region} · {restaurant.category}
          </span>
        </span>
        <span className="mt-2.5 w-full">
          <RestaurantImageList
            images={restaurant.images}
            restaurantName={restaurant.name}
          />
        </span>
        <span className="typo-body-7 text-primary-200 mt-3 line-clamp-2 w-full">
          {restaurant.description}
        </span>
        <span className="mt-0.5 flex flex-wrap gap-x-2 gap-y-1">
          {restaurant.hashtags.map((hashtag, index) => (
            <span
              className="typo-body-7 text-cool-gray-400"
              key={`${hashtag}-${index}`}
            >
              {hashtag}
            </span>
          ))}
        </span>
      </button>
    </li>
  )
}
