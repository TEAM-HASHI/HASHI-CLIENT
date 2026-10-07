import { MapPinTailIcon } from '@hashi/hds-icons'

import type { MapAreaMarkerData } from '@/pages/map/types'
import { cn } from '@/shared/utils'

interface MapAreaMarkerProps {
  area: MapAreaMarkerData
  onSelect: (code: string) => void
  belowAnchor?: boolean
}

export const MapAreaMarker = ({
  area,
  onSelect,
  belowAnchor = false,
}: MapAreaMarkerProps) => (
  <button
    type="button"
    aria-label={`${area.name} 식당 보기`}
    onClick={() => onSelect(area.code)}
    className={cn(
      'flex h-11 w-24 flex-col items-center justify-center whitespace-nowrap drop-shadow-[0_0_2px_rgba(0,0,0,0.2)] focus-visible:outline-2',
      belowAnchor && 'flex-col-reverse',
    )}
  >
    <span className="typo-body-6 flex items-center gap-0.5 rounded-full bg-white px-1.5 py-1">
      <span>{area.name}</span>
      <span className="bg-primary-400 rounded-full px-1.5 py-px text-white">
        {area.restaurantCount}
      </span>
    </span>
    <MapPinTailIcon
      aria-hidden="true"
      focusable="false"
      className={cn(
        'block h-1.25 w-2 shrink-0 text-white',
        belowAnchor && 'rotate-180',
      )}
    />
  </button>
)
