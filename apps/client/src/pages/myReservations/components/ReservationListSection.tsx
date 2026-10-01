import type { Ref } from 'react'
import { Button } from '@hashi/hds-ui'

import { ReservationCardsByStatus } from '@/pages/myReservations/components/ReservationCardsByStatus'
import { ReservationListSummary } from '@/pages/myReservations/components/ReservationListSummary'
import { ReservationListSkeleton } from '@/pages/myReservations/components/ReservationListSkeleton'
import type { ReservationStatusFilterValue } from '@/pages/myReservations/constants/reservationStatus'
import type {
  MyReservation,
  VisitedReservation,
} from '@/pages/myReservations/types'
import { Empty } from '@/shared/components/empty'
import { cn } from '@/shared/utils'

type ReservationListSectionProps = {
  selectedStatus: ReservationStatusFilterValue
  reservations: MyReservation[]
  totalCount: number
  hasNextPage: boolean
  isFetchNextPageError: boolean
  isFetchingNextPage: boolean
  isLoading: boolean
  loadMoreRef: Ref<HTMLDivElement>
  onCancelPress: (reservationId: string) => void
  onContactPress: (reservationId: string) => void
  onDetailPress: (reservationId: string) => void
  onEmptyActionPress: () => void
  onReviewPress: (reservation: VisitedReservation) => void
  onRetryLoadMore: () => void
}

export const ReservationListSection = ({
  selectedStatus,
  reservations,
  totalCount,
  hasNextPage,
  isFetchNextPageError,
  isFetchingNextPage,
  isLoading,
  loadMoreRef,
  onCancelPress,
  onContactPress,
  onDetailPress,
  onEmptyActionPress,
  onReviewPress,
  onRetryLoadMore,
}: ReservationListSectionProps) => {
  const hasReservations = reservations.length > 0

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <ReservationListSummary
        className={selectedStatus === 'IN_PROGRESS' ? 'mb-3.5' : undefined}
        totalCount={totalCount}
      />
      {isLoading ? (
        <ReservationListSkeleton selectedStatus={selectedStatus} />
      ) : hasReservations ? (
        <div
          className={cn(
            'flex flex-col',
            selectedStatus !== 'CANCELED' && 'gap-2',
          )}
        >
          <ReservationCardsByStatus
            reservations={reservations}
            selectedStatus={selectedStatus}
            onCancelPress={onCancelPress}
            onContactPress={onContactPress}
            onDetailPress={onDetailPress}
            onReviewPress={onReviewPress}
          />
          {isFetchNextPageError ? (
            <div className="flex flex-col items-center gap-3 py-5 text-center">
              <p className="typo-body-7 text-cool-gray-600">
                예약 정보를 더 불러오지 못했습니다.
              </p>
              <Button
                disabled={isFetchingNextPage}
                onClick={onRetryLoadMore}
                size="sm"
                variant="neutral"
              >
                다시 시도
              </Button>
            </div>
          ) : hasNextPage ? (
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
