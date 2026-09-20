import { Button } from '@hashi/hds-ui'

import { BottomActionBar } from '@/shared/components/bottomActionBar'

export type ReservationDetailActionBarProps = {
  onCancel: () => void
  onContact: () => void
}

export const ReservationDetailActionBar = ({
  onCancel,
  onContact,
}: ReservationDetailActionBarProps) => {
  return (
    <BottomActionBar
      aria-label="예약 상세 액션"
      startAction={
        <Button onClick={onCancel} size="lg" variant="neutral" width="full">
          예약 취소하기
        </Button>
      }
      endAction={
        <Button onClick={onContact} size="lg" variant="primary" width="full">
          문의하기
        </Button>
      }
    />
  )
}
