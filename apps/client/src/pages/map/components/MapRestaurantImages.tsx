import { Thumbnail } from '@hashi/hds-ui'

import type { MapRestaurant } from '@/pages/map/types'

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
