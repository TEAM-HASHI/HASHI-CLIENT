import { BackIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'

import { ReservationCancelDialog } from '@/features/reservation/components'
import { ReservationDetailActionBar } from '@/pages/reservationDetail/components/ReservationDetailActionBar'
import { ReservationNoticeSection } from '@/pages/reservationDetail/components/ReservationNoticeSection'
import { ReservationProgressSection } from '@/pages/reservationDetail/components/ReservationProgressSection'
import { ReservationReceiptInfoCard } from '@/pages/reservationDetail/components/ReservationReceiptInfoCard'
import { useReservationDetailPage } from '@/pages/reservationDetail/hooks/useReservationDetailPage'
import { cn } from '@/shared/utils'

const actionBarSafeSpaceClassName =
  'pb-[calc(80px+var(--safe-area-bottom,0px))]'

export const ReservationDetailPage = () => {
  const {
    reservationNotices,
    reservationProgressSteps,
    reservationReceiptInfoItems,
    reservationRestaurant,
    isCancelDialogOpen,
    handleBack,
    handleCancelDialogOpenChange,
    handleCancelReservation,
    handleConfirmCancelPress,
    handleHome,
  } = useReservationDetailPage()

  return (
    <section
      className={cn('min-h-dvh', 'pt-18.75', actionBarSafeSpaceClassName)}
    >
      <Header
        leftAction={
          <IconButton
            aria-label="이전 페이지로 이동"
            onClick={handleBack}
            size="xs"
          >
            <BackIcon className="size-6" />
          </IconButton>
        }
        title="예약 상세"
        className="app-mobile-fixed-top z-fixed fixed"
      />
      <div className="px-6">
        <ReservationProgressSection
          requestedDate="2026.6.21"
          requestedLabel="예약 신청"
          restaurant={reservationRestaurant}
          steps={reservationProgressSteps}
        />
        <ReservationReceiptInfoCard
          items={reservationReceiptInfoItems}
          title="예약 접수 정보"
        />
      </div>
      <ReservationNoticeSection notices={reservationNotices} />
      <ReservationDetailActionBar
        onCancel={handleCancelReservation}
        onHome={handleHome}
      />
      <ReservationCancelDialog
        open={isCancelDialogOpen}
        onConfirmCancelPress={handleConfirmCancelPress}
        onOpenChange={handleCancelDialogOpenChange}
      />
    </section>
  )
}
