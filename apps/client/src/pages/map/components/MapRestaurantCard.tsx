import {
  ClockSmallIcon,
  MoneySmallIcon,
  SaveBlankIcon,
  StarFillIcon,
} from '@hashi/hds-icons'
import { IconButton, Thumbnail } from '@hashi/hds-ui'

import type { MapRestaurant } from '@/pages/map/types'

export const MapRestaurantMeta = ({
  restaurant,
}: {
  restaurant: MapRestaurant
}) => (
  <div className="text-primary-200">
    <div className="flex h-6 items-center gap-1">
      <span className="typo-body-3 flex items-center">
        <StarFillIcon
          aria-hidden="true"
          className="text-primary-400 size-4.5"
        />
        {restaurant.rating.toFixed(1)}
      </span>
      <span className="typo-body-7">도쿄 · {restaurant.cuisine}</span>
    </div>
    <div className="typo-body-7 mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1">
      <span className="flex items-center gap-1">
        <ClockSmallIcon aria-hidden="true" className="size-4 shrink-0" />
        {restaurant.hours}
      </span>
      <span className="flex items-center gap-1">
        <MoneySmallIcon aria-hidden="true" className="size-4 shrink-0" />
        {restaurant.price}
      </span>
    </div>
  </div>
)

export const MapRestaurantImages = ({
  restaurant,
  onPhotoSelect,
}: {
  restaurant: MapRestaurant
  onPhotoSelect: (index: number) => void
}) => (
  <div
    className="mt-2 -mr-5 flex gap-2 overflow-x-auto pr-5 pb-1"
    aria-label={`${restaurant.name} 사진`}
  >
    {restaurant.images.length ? (
      restaurant.images.map((src, index) => (
        <button
          type="button"
          className="shrink-0 rounded-[5px] focus-visible:outline-2 focus-visible:-outline-offset-2"
          key={`${src}-${index}`}
          aria-label={`${restaurant.name} 사진 ${index + 1} 보기`}
          onClick={() => onPhotoSelect(index)}
        >
          <Thumbnail
            size="lg"
            src={src}
            alt={`${restaurant.name} 사진 ${index + 1}`}
          />
        </button>
      ))
    ) : (
      <Thumbnail size="lg" alt="등록된 샘플 사진 없음" />
    )}
  </div>
)

interface MapRestaurantCardProps {
  restaurant: MapRestaurant
  rank?: number
  onSelect: () => void
  onSave: () => void
}

export const MapSaveAction = ({
  restaurant,
  onSave,
}: Pick<MapRestaurantCardProps, 'restaurant' | 'onSave'>) => (
  <div className="flex shrink-0 flex-col items-center">
    <IconButton
      aria-label={`${restaurant.name} 저장`}
      size="sm"
      onClick={onSave}
      className="text-warm-gray-100"
    >
      <SaveBlankIcon className="size-9" />
    </IconButton>
    <span
      className="typo-caption-3 text-primary-200"
      aria-label={`샘플 저장 수 ${restaurant.saveCount}`}
    >
      {restaurant.saveCount.toLocaleString('en-US')}
    </span>
  </div>
)

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
