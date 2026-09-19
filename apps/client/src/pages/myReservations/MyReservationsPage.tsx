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
    <section className="app-mobile-bottom-nav-content flex h-[calc(100dvh-84px-var(--safe-area-bottom,0px))] min-h-0 flex-col overflow-hidden">
      <div className="z-fixed shrink-0 bg-white px-5 pt-[calc(32px+var(--safe-area-top,0px))]">
        <MyReservationsHeader userName={userName} />
        <ReservationStatusFilter
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
        />
      </div>
      <div className="flex min-h-0 flex-1 [scrollbar-width:none] flex-col overflow-y-auto overscroll-contain px-5 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
