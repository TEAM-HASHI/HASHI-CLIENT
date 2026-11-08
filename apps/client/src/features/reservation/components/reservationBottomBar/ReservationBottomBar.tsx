import { Button } from '@hashi/hds-ui'
import { BottomActionBar } from '@/shared/components/bottomActionBar'

interface ReservationBottomBarProps {
  disabled: boolean
  formId: string
}

export const ReservationBottomBar = ({
  disabled,
  formId,
}: ReservationBottomBarProps) => {
  return (
    <BottomActionBar
      aria-label="예약 입력 액션"
      layout="padded"
      endAction={
        <Button
          disabled={disabled}
          form={formId}
          size="lg"
          type="submit"
          width="full"
        >
          다음
        </Button>
      }
    />
  )
}
