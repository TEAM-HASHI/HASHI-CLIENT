import { useLocation } from 'react-router-dom'

import { checkIsReservationRequestDraft } from '@/features/reservation/reservationDraft'

export type {
  ReservationRequestDraft,
  RestaurantReservationRequestDraft,
  AnywhereReservationRequestDraft,
} from '@/features/reservation/reservationDraft'

export const useReservationRequestDraft = () => {
  const location = useLocation()

  if (checkIsReservationRequestDraft(location.state)) {
    return location.state
  }

  return null
}
