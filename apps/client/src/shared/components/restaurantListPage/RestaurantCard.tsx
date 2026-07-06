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
    <li className="h-[300px]">
      <button
        className="flex h-full w-full flex-col pt-[19px] text-left"
        onClick={handleClickRestaurant}
        type="button"
      >
        <span className="line-clamp-1 h-[19px] text-[16px] leading-normal font-medium text-[#273033]">
          {restaurant.name}
        </span>
        <span className="mt-1 flex h-5 items-center text-[#4a4a4a]">
          <StarFillIcon
            aria-hidden="true"
            className="size-[18px] shrink-0 text-[#fbda2a]"
          />
          <span className="ml-px text-[16px] leading-normal font-medium">
            {restaurant.rating}
          </span>
          <span className="ml-[5px] text-[14px] leading-5 font-normal">
            {restaurant.region} · {restaurant.category}
          </span>
        </span>
        <span className="mt-2.5 w-full">
          <RestaurantImageList
            images={restaurant.images}
            restaurantName={restaurant.name}
          />
        </span>
        <span className="mt-3 line-clamp-2 w-[340px] text-[14px] leading-5 font-normal text-[#4a4a4a]">
          {restaurant.description}
        </span>
        <span className="mt-0.5 flex flex-wrap gap-x-2 gap-y-1">
          {restaurant.hashtags.map((hashtag) => (
            <span
              className="text-[14px] leading-5 font-normal text-[#90a9b4]"
              key={hashtag}
            >
              {hashtag}
            </span>
          ))}
        </span>
      </button>
    </li>
  )
}
