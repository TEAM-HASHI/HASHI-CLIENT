import { ReservationCancelDialog } from '@/features/reservation/components'
import { MyReservationsHeader } from '@/pages/myReservations/components/MyReservationsHeader'
import { ReservationListSection } from '@/pages/myReservations/components/ReservationListSection'
import { ReservationStatusFilter } from '@/pages/myReservations/components/ReservationStatusFilter'
import { useMyReservationsPage } from '@/pages/myReservations/hooks/useMyReservationsPage'

export const MyReservationsPage = () => {
  const {
    userName,
    selectedStatus,
    reservations,
    totalCount,
    error,
    isLoading,
    hasNextPage,
    isCancelingReservation,
    loadMoreRef,
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

  if (error) {
    throw error
  }

  return (
    <section className="app-mobile-bottom-nav-content flex flex-col">
      <div className="app-mobile-fixed-top z-fixed shadow-header bg-white px-5 pt-[calc(32px+var(--safe-area-top,0px))]">
        <MyReservationsHeader userName={userName} />
        <ReservationStatusFilter
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
        />
      </div>
      <div className="flex flex-1 flex-col px-5 pt-[calc(132px+var(--safe-area-top,0px))]">
        <ReservationListSection
          reservations={reservations}
          selectedStatus={selectedStatus}
          totalCount={totalCount}
          hasNextPage={hasNextPage}
          isLoading={isLoading}
          loadMoreRef={loadMoreRef}
          onCancelPress={handleCancelPress}
          onContactPress={handleContactPress}
          onDetailPress={handleDetailPress}
          onEmptyActionPress={handleEmptyActionPress}
          onReviewPress={handleReviewPress}
        />
      </div>
      <ReservationCancelDialog
        open={isCancelDialogOpen}
        isConfirming={isCancelingReservation}
        onConfirmCancelPress={handleConfirmCancelPress}
        onOpenChange={handleCancelDialogOpenChange}
      />
    </section>
  )
}
