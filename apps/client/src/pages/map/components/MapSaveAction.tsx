import { SaveBlankIcon } from '@hashi/hds-icons'
import { IconButton } from '@hashi/hds-ui'

import type { MapRestaurant } from '@/pages/map/types'

export const MapSaveAction = ({
  restaurant,
  onSave,
}: {
  restaurant: MapRestaurant
  onSave: () => void
}) => (
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
