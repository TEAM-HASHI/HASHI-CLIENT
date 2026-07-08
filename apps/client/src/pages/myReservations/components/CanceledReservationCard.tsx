import { ReservationCardImage } from '@/pages/myReservations/components/ReservationCardImage'
import type { CanceledReservation } from '@/pages/myReservations/types'

type CanceledReservationCardProps = {
  reservation: CanceledReservation
}

export const CanceledReservationCard = ({
  reservation,
}: CanceledReservationCardProps) => {
  return (
    <article className="border-warm-gray-50 border-b pb-3.5 last:border-0">
      <div className="flex gap-3">
        <ReservationCardImage
          disabled
          className="size-23"
          imageUrl={reservation.restaurantImageUrl}
          restaurantName={reservation.restaurantName}
        />
        <div className="min-w-0 pt-0.5">
          <h2 className="typo-body-3 text-warm-gray-300 line-clamp-2 line-through">
            {reservation.restaurantName}
          </h2>
          <p className="typo-body-7 text-warm-gray-300 mt-2">
            {reservation.visitDateTime}
          </p>
          <p className="typo-body-7 text-warm-gray-300 mt-0.5">
            {reservation.guestSummary}
          </p>
        </div>
      </div>
    </article>
  )
}
