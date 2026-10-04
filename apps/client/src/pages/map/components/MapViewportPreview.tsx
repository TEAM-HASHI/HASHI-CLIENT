import { BackIcon, SaveIcon, StarFillIcon } from '@hashi/hds-icons'
import { IconButton } from '@hashi/hds-ui'

import {
  MAP_PREVIEW_AREAS,
  MAP_PREVIEW_RESTAURANTS,
} from '@/pages/map/data/mapPreviewRestaurants'
import type { MapRestaurant } from '@/pages/map/types'
import mapOverview from '@/shared/assets/images/map/tokyo-overview.webp'
import mapStreets from '@/shared/assets/images/map/tokyo-streets.webp'
import pinRestaurant from '@/shared/assets/images/map/pin-restaurant.webp'
import pinBar from '@/shared/assets/images/map/pin-bar.webp'
import pinCafe from '@/shared/assets/images/map/pin-cafe.webp'
import areaPinTail from '@/shared/assets/images/map/area-pin-tail.svg'
import { cn } from '@/shared/utils'

const PINS = { restaurant: pinRestaurant, bar: pinBar, cafe: pinCafe }

interface MapViewportPreviewProps {
  restaurants: MapRestaurant[]
  selectedId: string | null
  zoomed: boolean
  panelHeight: number
  onSelectRestaurant: (id: string) => void
  onSelectArea: (code: string) => void
  onResetArea: () => void
  onSaved: () => void
}

export const MapViewportPreview = ({
  restaurants,
  selectedId,
  zoomed,
  panelHeight,
  onSelectRestaurant,
  onSelectArea,
  onResetArea,
  onSaved,
}: MapViewportPreviewProps) => (
  <div
    className="absolute inset-0 overflow-hidden"
    role="region"
    aria-label="도쿄 지도 미리보기"
  >
    {zoomed ? (
      <div className="pointer-events-none absolute -top-[83px] -left-[16.3%] aspect-[505/776] w-[128.5%] overflow-hidden">
        <img
          alt=""
          src={mapStreets}
          className="absolute -top-[62.24%] -left-[0.05%] h-[162.24%] w-[152.77%] max-w-none"
        />
      </div>
    ) : (
      <img
        alt=""
        src={mapOverview}
        className="absolute -top-11.25 -left-[1%] h-auto w-[104%] max-w-none"
      />
    )}
    <div className="absolute inset-x-0 top-0 h-137.25">
      {zoomed
        ? restaurants.map((restaurant) => (
            <button
              type="button"
              key={restaurant.id}
              aria-label={`${restaurant.name} 지도 마커`}
              aria-pressed={selectedId === restaurant.id}
              className={cn(
                'absolute flex min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-2',
                selectedId === restaurant.id &&
                  'border-cool-gray-600 z-10 max-w-[60%] gap-1 border bg-white py-1.5 pr-4 pl-2 shadow-sm',
              )}
              style={{
                left: `${restaurant.marker.x}%`,
                top: `${restaurant.marker.y}%`,
              }}
              onClick={() => onSelectRestaurant(restaurant.id)}
            >
              <img
                alt=""
                src={PINS[restaurant.category]}
                width={28}
                height={28}
                className="shrink-0 rounded-full"
              />
              {selectedId === restaurant.id && (
                <span className="min-w-0 text-left">
                  <span className="typo-caption-1 block truncate">
                    {restaurant.name}
                  </span>
                  <span className="typo-caption-1 text-cool-gray-600 flex items-center">
                    <StarFillIcon className="size-3" />
                    {restaurant.rating.toFixed(1)}
                  </span>
                </span>
              )}
            </button>
          ))
        : MAP_PREVIEW_AREAS.map((area) => (
            <button
              type="button"
              key={area.code}
              aria-label={`${area.name} 식당 보기`}
              onClick={() => onSelectArea(area.code)}
              className="absolute flex min-h-11 flex-col items-center justify-center drop-shadow-[0_0_2px_rgba(0,0,0,0.2)] focus-visible:outline-2"
              style={{ left: `${area.x}%`, top: `${area.y}%` }}
            >
              <span className="typo-body-6 flex items-center gap-0.5 rounded-full bg-white px-1.5 py-1">
                <span>{area.name}</span>
                <span className="bg-primary-400 rounded-full px-1.5 py-px text-white">
                  {
                    MAP_PREVIEW_RESTAURANTS.filter(
                      ({ areaCode }) => areaCode === area.code,
                    ).length
                  }
                </span>
              </span>
              <img alt="" src={areaPinTail} />
            </button>
          ))}
    </div>
    {zoomed && (
      <IconButton
        aria-label="전체 지역 보기"
        variant="soft"
        size="sm"
        className="absolute top-30 left-5 shadow-sm"
        onClick={onResetArea}
      >
        <BackIcon className="size-5" />
      </IconButton>
    )}
    <IconButton
      aria-label="저장 목록 보기"
      variant="soft"
      className="absolute left-5 size-11 shadow-sm"
      style={{ bottom: panelHeight + 20 }}
      onClick={onSaved}
    >
      <SaveIcon className="text-warm-gray-300 size-6" />
    </IconButton>
  </div>
)
