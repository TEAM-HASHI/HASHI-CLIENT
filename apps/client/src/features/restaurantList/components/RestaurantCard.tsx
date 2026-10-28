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
  const visibleHashtags = restaurant.hashtags.slice(0, 3)

  const handleClickRestaurant = () => {
    onClick(restaurant.id)
  }

  return (
    <li className="border-warm-gray-50 flex w-full flex-col gap-3 border-b py-4 last:border-b-0">
      <button
        className="flex w-full flex-col gap-3 text-left"
        onClick={handleClickRestaurant}
        type="button"
      >
        <span className="flex w-full flex-col gap-2">
          <span className="flex flex-col gap-0.5">
            <span className="typo-body-3 text-cool-gray-900 line-clamp-1">
              {restaurant.name}
            </span>
            <span className="text-primary-200 flex h-6 items-center gap-1">
              <span className="flex items-center gap-0.5">
                <StarFillIcon
                  aria-hidden="true"
                  className="text-primary-400 size-4.5 shrink-0"
                />
                <span className="typo-body-4">{ratingLabel}</span>
              </span>
              <span className="typo-body-7">
                {restaurant.region} · {restaurant.category}
              </span>
            </span>
          </span>
          <span className="w-full">
            <RestaurantImageList
              images={restaurant.images}
              restaurantName={restaurant.name}
            />
          </span>
        </span>
        <span className="flex w-full flex-col gap-0.5">
          <span className="text-primary-200 line-clamp-2 w-full text-[15px] leading-[1.5]">
            {restaurant.description}
          </span>
          <span className="flex h-5 w-full flex-nowrap gap-2 overflow-hidden">
            {visibleHashtags.map((hashtag, index) => (
              <span
                className="typo-body-7 text-cool-gray-400 min-w-0 truncate"
                key={`${hashtag}-${index}`}
              >
                {hashtag}
              </span>
            ))}
          </span>
        </span>
      </button>
    </li>
  )
}
