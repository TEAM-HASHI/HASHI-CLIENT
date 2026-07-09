import { CanceledReservationCard } from '@/pages/myReservations/components/CanceledReservationCard'
import { InProgressReservationCard } from '@/pages/myReservations/components/InProgressReservationCard'
import { UpcomingReservationCard } from '@/pages/myReservations/components/UpcomingReservationCard'
import { VisitedReservationCard } from '@/pages/myReservations/components/VisitedReservationCard'
import type { ReservationStatusFilterValue } from '@/pages/myReservations/constants/reservationStatus'
import type {
  MyReservation,
  VisitedReservation,
} from '@/pages/myReservations/types'

type ReservationCardsByStatusProps = {
  selectedStatus: ReservationStatusFilterValue
  reservations: MyReservation[]
  onCancelPress: (reservationId: string) => void
  onContactPress: (reservationId: string) => void
  onDetailPress: (reservationId: string) => void
  onReviewPress: (reservation: VisitedReservation) => void
}

const getReservationsByStatus = <TStatus extends ReservationStatusFilterValue>(
  reservations: MyReservation[],
  status: TStatus,
) => {
  return reservations.filter(
    (reservation): reservation is Extract<MyReservation, { status: TStatus }> =>
      reservation.status === status,
  )
}

export const ReservationCardsByStatus = ({
  selectedStatus,
  reservations,
  onCancelPress,
  onContactPress,
  onDetailPress,
  onReviewPress,
}: ReservationCardsByStatusProps) => {
  if (selectedStatus === 'IN_PROGRESS') {
    return getReservationsByStatus(reservations, 'IN_PROGRESS').map(
      (reservation) => (
        <InProgressReservationCard
          key={reservation.reservationId}
          reservation={reservation}
          onContactPress={onContactPress}
          onDetailPress={onDetailPress}
        />
      ),
    )
  }

  if (selectedStatus === 'UPCOMING') {
    return getReservationsByStatus(reservations, 'UPCOMING').map(
      (reservation) => (
        <UpcomingReservationCard
          key={reservation.reservationId}
          reservation={reservation}
          onCancelPress={onCancelPress}
          onContactPress={onContactPress}
        />
      ),
    )
  }

  if (selectedStatus === 'VISITED') {
    return getReservationsByStatus(reservations, 'VISITED').map(
      (reservation) => (
        <VisitedReservationCard
          key={reservation.reservationId}
          reservation={reservation}
          onReviewPress={onReviewPress}
        />
      ),
    )
  }

  return getReservationsByStatus(reservations, 'CANCELED').map(
    (reservation) => (
      <CanceledReservationCard
        key={reservation.reservationId}
        reservation={reservation}
      />
    ),
  )
}
