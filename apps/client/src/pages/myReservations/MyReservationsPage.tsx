import { MyReservationsHeader } from '@/pages/myReservations/components/MyReservationsHeader'
import { ReservationCancelDialog } from '@/pages/myReservations/components/ReservationCancelDialog'
import { ReservationListSection } from '@/pages/myReservations/components/ReservationListSection'
import { ReservationStatusFilter } from '@/pages/myReservations/components/ReservationStatusFilter'
import { useMyReservationsPage } from '@/pages/myReservations/hooks/useMyReservationsPage'

export const MyReservationsPage = () => {
  const {
    userName,
    selectedStatus,
    reservations,
    totalCount,
    isCancelDialogOpen,
    handleStatusChange,
    handleCancelPress,
    handleCancelDialogOpenChange,
    handleContactPress,
    handleConfirmCancelPress,
    handleDetailPress,
    handleEmptyActionPress,
    handleReviewPress,
  } = useMyReservationsPage()

  return (
    <section className="app-mobile-bottom-nav-content flex flex-col">
      <div className="app-mobile-fixed-top z-fixed shadow-header bg-white px-5 pt-[calc(32px+var(--safe-area-top,0px))]">
        <MyReservationsHeader userName={userName} />
        <ReservationStatusFilter
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
        />
      </div>
      <div className="px-5 pt-[calc(132px+var(--safe-area-top,0px))]">
        <ReservationListSection
          reservations={reservations}
          selectedStatus={selectedStatus}
          totalCount={totalCount}
          onCancelPress={handleCancelPress}
          onContactPress={handleContactPress}
          onDetailPress={handleDetailPress}
          onEmptyActionPress={handleEmptyActionPress}
          onReviewPress={handleReviewPress}
        />
      </div>
      <ReservationCancelDialog
        open={isCancelDialogOpen}
        onConfirmCancelPress={handleConfirmCancelPress}
        onOpenChange={handleCancelDialogOpenChange}
      />
    </section>
  )
}
