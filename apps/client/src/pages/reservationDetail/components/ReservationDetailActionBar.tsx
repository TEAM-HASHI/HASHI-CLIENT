import { Button } from '@hashi/hds-ui'

export type ReservationDetailActionBarProps = {
  onCancel: () => void
  onHome: () => void
}

export const ReservationDetailActionBar = ({
  onCancel,
  onHome,
}: ReservationDetailActionBarProps) => {
  return (
    <div className="app-mobile-fixed-bottom z-fixed bg-white px-6 pt-4.25 pb-[calc(20px+var(--safe-area-bottom,0px))]">
      <div className="grid grid-cols-2 gap-2.5">
        <Button onClick={onCancel} size="md" variant="neutral" width="full">
          예약 취소하기
        </Button>
        <Button onClick={onHome} size="md" variant="primary" width="full">
          홈으로 돌아가기
        </Button>
      </div>
    </div>
  )
}
