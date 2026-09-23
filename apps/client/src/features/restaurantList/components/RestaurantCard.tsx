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
    <li className="border-warm-gray-50 flex w-full flex-col gap-3 border-b py-4 last:border-b-0">
      <button
        className="flex w-full flex-col gap-3 text-left"
        onClick={handleClickRestaurant}
        type="button"
      >
        <span className="flex flex-col gap-2">
          <span
            className="typo-body-3 text-cool-gray-900 line-clamp-1"
            data-slot="restaurant-name"
          >
            {restaurant.name}
          </span>
          <span
            className="text-primary-200 flex h-5 items-center gap-1"
            data-slot="restaurant-rating"
          >
            <span className="flex items-center gap-px">
              <StarFillIcon
                aria-hidden="true"
                className="text-primary-400 size-4.5 shrink-0"
              />
              <span className="text-[16px] leading-none">{ratingLabel}</span>
            </span>
            <span className="text-[14px] leading-none">
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
        <span
          className="text-primary-200 line-clamp-2 w-full text-[15px] leading-[1.5]"
          data-slot="restaurant-description"
        >
          {restaurant.description}
        </span>
        <span
          className="flex h-5 flex-wrap gap-2 overflow-hidden"
          data-slot="restaurant-hashtags"
        >
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
