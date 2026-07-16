import type { Ref } from 'react'

import { ReservationCardsByStatus } from '@/pages/myReservations/components/ReservationCardsByStatus'
import { ReservationListSummary } from '@/pages/myReservations/components/ReservationListSummary'
import { ReservationListSkeleton } from '@/pages/myReservations/components/ReservationListSkeleton'
import type { ReservationStatusFilterValue } from '@/pages/myReservations/constants/reservationStatus'
import type {
  MyReservation,
  VisitedReservation,
} from '@/pages/myReservations/types'
import { Empty } from '@/shared/components/empty'

type ReservationListSectionProps = {
  selectedStatus: ReservationStatusFilterValue
  reservations: MyReservation[]
  totalCount: number
  hasNextPage: boolean
  isLoading: boolean
  loadMoreRef: Ref<HTMLDivElement>
  onCancelPress: (reservationId: string) => void
  onContactPress: (reservationId: string) => void
  onDetailPress: (reservationId: string) => void
  onEmptyActionPress: () => void
  onReviewPress: (reservation: VisitedReservation) => void
}

export const ReservationListSection = ({
  selectedStatus,
  reservations,
  totalCount,
  hasNextPage,
  isLoading,
  loadMoreRef,
  onCancelPress,
  onContactPress,
  onDetailPress,
  onEmptyActionPress,
  onReviewPress,
}: ReservationListSectionProps) => {
  const hasReservations = reservations.length > 0

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <ReservationListSummary totalCount={totalCount} sortLabel="최신순" />
      {isLoading ? (
        <ReservationListSkeleton selectedStatus={selectedStatus} />
      ) : hasReservations ? (
        <div className="mb-2 flex flex-col gap-4">
          <ReservationCardsByStatus
            reservations={reservations}
            selectedStatus={selectedStatus}
            onCancelPress={onCancelPress}
            onContactPress={onContactPress}
            onDetailPress={onDetailPress}
            onReviewPress={onReviewPress}
          />
          {hasNextPage ? (
            <div
              ref={loadMoreRef}
              aria-hidden="true"
              data-testid="my-reservations-load-more"
            />
          ) : null}
        </div>
      ) : (
        <Empty
          actionLabel="일본 맛집 추천받기"
          description={
            <>
              가고 싶은 맛집을 찾아
              <br />
              Hashi에게 예약을 맡겨보세요!
            </>
          }
          onAction={onEmptyActionPress}
        />
      )}
    </section>
  )
}
