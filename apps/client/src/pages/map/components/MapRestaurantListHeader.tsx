import type { RefObject } from 'react'

import { MapSortMenu } from '@/pages/map/components/MapSortMenu'
import type { MapSort } from '@/pages/map/types'

interface MapRestaurantListHeaderProps {
  filtered: boolean
  sort: MapSort
  sortTriggerRef: RefObject<HTMLButtonElement | null>
  onSortChange: (sort: MapSort) => void
}

export const MapRestaurantListHeader = ({
  filtered,
  sort,
  sortTriggerRef,
  onSortChange,
}: MapRestaurantListHeaderProps) => (
  <div className="flex min-h-9 items-center justify-between gap-2 bg-white px-5 py-1">
    <h2 className="typo-sub-header-3 text-cool-gray-600 min-w-0 truncate">
      {filtered ? '검색한 맛집' : '지금 도쿄에서 제일 핫한 맛집'}
    </h2>
    <MapSortMenu
      value={sort}
      onChange={onSortChange}
      triggerRef={sortTriggerRef}
    />
  </div>
)
