import { MapViewIcon } from '@hashi/hds-icons'
import { Button } from '@hashi/hds-ui'

import { cn } from '@/shared/utils'

interface MapViewButtonProps {
  onClick: () => void
  disabled?: boolean
}

export const MapViewButton = ({
  onClick,
  disabled = false,
}: MapViewButtonProps) => (
  <Button
    size="md"
    disabled={disabled}
    onClick={onClick}
    className="disabled:bg-warm-gray-50 disabled:text-warm-gray-300 h-11 gap-0.5 rounded-full px-3 py-2.5 shadow-[0_4px_4px_rgba(0,0,0,0.15)] disabled:shadow-none"
    leftIcon={
      <MapViewIcon
        aria-hidden="true"
        focusable="false"
        className={cn(
          'size-6',
          disabled
            ? 'fill-warm-gray-300 stroke-warm-gray-300'
            : 'fill-secondary-200 stroke-primary-100',
        )}
      />
    }
  >
    지도로 보기
  </Button>
)
