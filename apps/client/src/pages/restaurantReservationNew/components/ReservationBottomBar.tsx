import { Button } from '@hashi/hds-ui'

interface ReservationBottomBarProps {
  disabled: boolean
  formId: string
}

export const ReservationBottomBar = ({
  disabled,
  formId,
}: ReservationBottomBarProps) => {
  return (
    <div className="app-mobile-fixed-bottom z-20 bg-white px-5 pt-[17px] pb-[calc(17px+var(--safe-area-bottom,0px))]">
      <Button
        disabled={disabled}
        form={formId}
        size="lg"
        type="submit"
        width="full"
      >
        예약하기
      </Button>
    </div>
  )
}
