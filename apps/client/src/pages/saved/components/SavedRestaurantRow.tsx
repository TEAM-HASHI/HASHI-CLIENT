import { MenuIcon, StarFillIcon } from '@hashi/hds-icons'
import { Thumbnail } from '@hashi/hds-ui'
import type { ReactNode } from 'react'

import type { SavedRestaurant } from '@/pages/saved/types'

type SavedRestaurantRowProps = {
  restaurant: SavedRestaurant
  onSelect?: (restaurantId: string) => void
  moreAction?: ReactNode
  selection?: ReactNode
  editing?: boolean
}

export const SavedRestaurantRow = ({
  restaurant,
  onSelect,
  moreAction,
  selection,
  editing,
}: SavedRestaurantRowProps) => {
  const content = (
    <>
      <Thumbnail src={restaurant.image} alt="" className="size-25" />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="typo-body-3 text-cool-gray-900 [overflow-wrap:anywhere] break-words">
          {restaurant.name}
        </span>
        <span className="text-primary-200 flex flex-wrap items-center gap-x-1">
          <span className="typo-body-3 flex h-6 items-center">
            <StarFillIcon
              aria-hidden="true"
              className="text-primary-400 size-4.5"
            />
            {restaurant.rating.toFixed(1)}
          </span>
          <span className="typo-body-7 [overflow-wrap:anywhere] break-words">
            {restaurant.region} · {restaurant.cuisine}
          </span>
        </span>
      </span>
    </>
  )

  return (
    <li
      className="border-warm-gray-50 flex items-start gap-4 border-b py-4"
      data-restaurant-id={restaurant.id}
    >
      {selection}
      {onSelect ? (
        <button
          type="button"
          className="flex min-w-0 flex-1 items-start gap-4 text-left focus-visible:outline-2"
          onClick={() => onSelect(restaurant.id)}
        >
          {content}
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 items-start gap-4">{content}</div>
      )}
      {!editing &&
        (moreAction ?? (
          <MenuIcon
            aria-hidden="true"
            className="text-warm-gray-300 size-4.5 shrink-0"
          />
        ))}
    </li>
  )
}
