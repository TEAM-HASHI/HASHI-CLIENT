import { StarFillIcon } from '@hashi/hds-icons'

import { RestaurantImageList } from '@/features/restaurantList/components/RestaurantImageList'
import type { Restaurant } from '@/features/restaurantList/types'

type RestaurantCardProps = {
  restaurant: Restaurant
  onClick: (restaurantId: string) => void
}

export const RestaurantCard = ({
  restaurant,
  onClick,
}: RestaurantCardProps) => {
  const ratingLabel = restaurant.rating.toFixed(1)

  const handleClickRestaurant = () => {
    onClick(restaurant.id)
  }

  return (
    <li className="border-warm-gray-50 w-full border-b py-4 last:border-b-0">
      <button
        className="flex w-full flex-col text-left"
        onClick={handleClickRestaurant}
        type="button"
      >
        <span className="typo-body-3 text-cool-gray-900 line-clamp-1 font-medium">
          {restaurant.name}
        </span>
        <span className="text-primary-200 mt-0.5 flex h-6 items-center">
          <StarFillIcon
            aria-hidden="true"
            className="text-primary-400 size-4.5 shrink-0"
          />
          <span className="typo-body-3 ml-0.5">{ratingLabel}</span>
          <span className="typo-body-7 ml-1">
            {restaurant.region} · {restaurant.category}
          </span>
        </span>
        <span className="mt-2 w-full">
          <RestaurantImageList
            images={restaurant.images}
            restaurantName={restaurant.name}
          />
        </span>
        <span className="typo-long-body-1 text-primary-200 mt-3 line-clamp-2 w-full">
          {restaurant.description}
        </span>
        <span className="mt-0.5 flex min-w-0 flex-nowrap gap-2 overflow-hidden">
          {restaurant.hashtags.map((hashtag, index) => (
            <span
              className="typo-body-7 text-cool-gray-400 shrink-0 whitespace-nowrap"
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
