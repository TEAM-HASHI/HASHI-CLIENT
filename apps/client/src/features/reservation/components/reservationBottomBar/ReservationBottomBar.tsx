import { Button } from '@hashi/hds-ui'
import { PageFixedArea } from '@/shared/components/pageFixedArea/PageFixedArea'

interface ReservationBottomBarProps {
  disabled: boolean
  formId: string
}

export const ReservationBottomBar = ({
  disabled,
  formId,
}: ReservationBottomBarProps) => {
  return (
    <PageFixedArea>
      <div className="app-mobile-fixed-bottom z-fixed bg-white px-5 pt-[17px] pb-[calc(17px+var(--safe-area-bottom,0px))]">
        <Button
          disabled={disabled}
          form={formId}
          size="lg"
          type="submit"
          width="full"
        >
          다음
        </Button>
      </div>
    </PageFixedArea>
  )
}
