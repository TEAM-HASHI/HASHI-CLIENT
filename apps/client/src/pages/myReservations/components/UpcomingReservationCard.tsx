import { Button } from '@hashi/hds-ui'

import { ReservationCardImage } from '@/pages/myReservations/components/ReservationCardImage'
import type { UpcomingReservation } from '@/pages/myReservations/types'

type UpcomingReservationCardProps = {
  reservation: UpcomingReservation
  onCancelPress: (reservationId: string) => void
  onContactPress: (reservationId: string) => void
  onDetailPress: (reservationId: string) => void
}

export const UpcomingReservationCard = ({
  reservation,
  onCancelPress,
  onContactPress,
  onDetailPress,
}: UpcomingReservationCardProps) => {
  return (
    <article className="border-secondary-200 border-b pb-4 last:border-b-0 last:pb-0">
      <button
        className="flex w-full gap-3 text-left"
        onClick={() => onDetailPress(reservation.reservationId)}
        type="button"
      >
        <ReservationCardImage
          className="size-23"
          imageUrl={reservation.restaurantImageUrl}
          restaurantName={reservation.restaurantName}
        />
        <div className="min-w-0 pt-0.5">
          <h2 className="typo-sub-header-2 text-cool-gray-900 line-clamp-2">
            {reservation.restaurantName}
          </h2>
          <p className="typo-body-7 text-cool-gray-600 mt-2">
            {reservation.visitDateTime}
          </p>
          <p className="typo-body-7 text-cool-gray-600 mt-0.5">
            {reservation.guestSummary}
          </p>
        </div>
      </button>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button
          onClick={() => onCancelPress(reservation.reservationId)}
          size="sm"
          variant="neutral"
          width="full"
        >
          취소하기
        </Button>
        <Button
          onClick={() => onContactPress(reservation.reservationId)}
          size="sm"
          width="full"
        >
          문의하기
        </Button>
      </div>
    </article>
  )
}
