import type { MapRestaurant } from '@/pages/map/types'

import { MapRestaurantMeta } from '@/pages/map/components/MapRestaurantMeta'
import { MapRestaurantImages } from '@/pages/map/components/MapRestaurantImages'
import { MapSaveAction } from '@/pages/map/components/MapSaveAction'

interface MapRestaurantCardProps {
  restaurant: MapRestaurant
  rank?: number
  onSelect: () => void
  onSave: () => void
}

export const MapRestaurantCard = ({
  restaurant,
  rank,
  onSelect,
  onSave,
}: MapRestaurantCardProps) => (
  <article className="border-warm-gray-50 border-b py-4">
    <div className="flex items-start gap-1">
      <div className="min-w-0 flex-1">
        <h3>
          <button
            type="button"
            aria-label={`${restaurant.name} 상세 보기`}
            className="text-primary-200 flex w-full items-center gap-2 text-left"
            onClick={onSelect}
          >
            {rank !== undefined && (
              <span aria-hidden="true" className="typo-header-1 shrink-0">
                {rank}
              </span>
            )}
            <span className="typo-sub-header-1 truncate">
              {restaurant.name}
            </span>
          </button>
        </h3>
        <MapRestaurantMeta restaurant={restaurant} />
      </div>
      <MapSaveAction restaurant={restaurant} onSave={onSave} />
    </div>
    <MapRestaurantImages restaurant={restaurant} onPhotoSelect={onSelect} />
  </article>
)
