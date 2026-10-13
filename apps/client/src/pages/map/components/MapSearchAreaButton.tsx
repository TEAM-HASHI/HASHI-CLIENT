import { LocationIcon } from '@hashi/hds-icons'
import { Button } from '@hashi/hds-ui'

export const MapSearchAreaButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    onClick={onClick}
    className="typo-body-6 h-11 gap-0.5 rounded-full px-3 shadow-[0_4px_4px_rgba(0,0,0,0.15)]"
    leftIcon={<LocationIcon className="size-6" />}
  >
    현재 위치에서 검색
  </Button>
)
