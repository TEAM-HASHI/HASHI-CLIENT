import {
  BarMarkerIcon,
  CafeMarkerIcon,
  RestaurantMarkerIcon,
  StarFillIcon,
} from '@hashi/hds-icons'

import type { MapRestaurant } from '@/pages/map/types'
import { cn } from '@/shared/utils'

const ICONS = {
  restaurant: RestaurantMarkerIcon,
  cafe: CafeMarkerIcon,
  bar: BarMarkerIcon,
}

// Figma uses different optical offsets per category, not uniform scaling.
const ICON_LAYOUT = {
  restaurant: {
    normal: 'left-[2.58px] top-[2.58px] origin-top-left scale-[0.64516]',
    selected: 'left-1 top-1',
  },
  cafe: {
    normal: 'left-[3.871px] top-[3.871px] origin-top-left scale-[0.64516]',
    selected: 'left-1.5 top-[5.5px]',
  },
  bar: {
    normal: 'left-[3.228px] top-[1.938px] origin-top-left scale-[0.70382]',
    selected: 'left-1.25 top-[3.5px]',
  },
}

interface MapRestaurantMarkerProps {
  restaurant: Pick<MapRestaurant, 'id' | 'name' | 'category' | 'rating'>
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
            : 'size-5 shadow-[0_0_2.58px_1px_rgba(0,0,0,0.25)] ring-1 ring-white',
        )}
      >
        <Icon
          aria-hidden="true"
          focusable="false"
          className={cn(
            'text-primary-400 absolute size-5.5 max-w-none',
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
          <span className="typo-caption-2 text-cool-gray-600 flex items-center leading-[1.5]">
            <StarFillIcon
              aria-hidden="true"
              className="text-cool-gray-300 size-3"
            />
            {restaurant.rating.toFixed(1)}
          </span>
        </span>
      )}
    </button>
  )
}
