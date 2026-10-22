import { SaveBlankIcon, SaveIcon } from '@hashi/hds-icons'
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
      aria-pressed={restaurant.saved ?? false}
      size="sm"
      onClick={onSave}
      className="text-warm-gray-100"
    >
      {restaurant.saved ? (
        <SaveIcon className="text-primary-200 size-9" />
      ) : (
        <SaveBlankIcon className="size-9" />
      )}
    </IconButton>
    {restaurant.saveCount !== undefined && (
      <span
        className="typo-caption-3 text-primary-200"
        aria-label={`저장 수 ${restaurant.saveCount}`}
      >
        {restaurant.saveCount.toLocaleString('en-US')}
      </span>
    )}
  </div>
)
