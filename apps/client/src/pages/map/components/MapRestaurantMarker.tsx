import {
  BarCategoryIcon,
  CafeCategoryIcon,
  RestaurantCategoryIcon,
  StarFillIcon,
} from '@hashi/hds-icons'

import type { MapRestaurant } from '@/pages/map/types'
import { cn } from '@/shared/utils'

const ICONS = {
  restaurant: RestaurantCategoryIcon,
  cafe: CafeCategoryIcon,
  bar: BarCategoryIcon,
}

// Figma uses different optical offsets per category, not uniform scaling.
const ICON_LAYOUT = {
  restaurant: {
    normal: 'left-0.5 top-0.625 size-4',
    selected: 'left-1 top-1 size-5.5',
  },
  cafe: {
    normal: 'left-0.75 top-0.625 size-4',
    selected: 'left-1.5 top-[5.5px] size-5.5',
  },
  bar: {
    normal: 'left-0.625 top-0.375 size-4',
    selected: 'left-1.25 top-[3.5px] size-5.5',
  },
}

interface MapRestaurantMarkerProps {
  restaurant: Pick<MapRestaurant, 'id' | 'name' | 'category'> & {
    rating?: number
  }
  isSelected: boolean
  onSelect: (id: string) => void
}

export const MapRestaurantMarker = ({
  restaurant,
  isSelected,
  onSelect,
}: MapRestaurantMarkerProps) => {
  const Icon = ICONS[restaurant.category]
  return (
    <button
      type="button"
      aria-label={`${restaurant.name} 지도 마커`}
      aria-pressed={isSelected}
      className={cn(
        'flex min-h-11 max-w-full min-w-11 items-center justify-center rounded-full focus-visible:outline-2',
        isSelected &&
          'border-cool-gray-600 gap-1 border bg-white py-1.5 pr-4 pl-2 shadow-[0_0_4px_rgba(0,0,0,0.2)]',
      )}
      onClick={() => onSelect(restaurant.id)}
    >
      <span
        className={cn(
          'bg-cool-gray-800 relative block shrink-0 rounded-full',
          isSelected
            ? 'size-7.75'
            : 'size-5 shadow-[0_0_2.58px_rgba(0,0,0,0.25)] ring-1 ring-white ring-inset',
        )}
      >
        <Icon
          aria-hidden="true"
          focusable="false"
          className={cn(
            'text-primary-100 absolute max-w-none',
            ICON_LAYOUT[restaurant.category][
              isSelected ? 'selected' : 'normal'
            ],
          )}
        />
      </span>
      {isSelected && (
        <span className="min-w-0 text-left">
          <span className="typo-caption-1 text-primary-200 block truncate font-medium">
            {restaurant.name}
          </span>
          {restaurant.rating !== undefined && (
            <span className="typo-caption-2 text-cool-gray-600 flex items-center leading-[1.5]">
              <StarFillIcon
                aria-hidden="true"
                className="text-cool-gray-300 size-3"
              />
              {restaurant.rating.toFixed(1)}
            </span>
          )}
        </span>
      )}
    </button>
  )
}
