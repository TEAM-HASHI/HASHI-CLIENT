import type { ReservationStatusFilterValue } from '@/pages/myReservations/constants/reservationStatus'

type MyReservationBase = {
  reservationId: string
  restaurantId: string | null
  restaurantName: string
  restaurantImageUrl?: string | null
  visitDateTime: string
  guestSummary: string
  status: ReservationStatusFilterValue
}

export type InProgressReservation = MyReservationBase & {
  status: 'IN_PROGRESS'
  reservedAt: string
  remainingDays: number
  progressStep: 'RECEIVED' | 'CONTACTING' | 'CONFIRMED'
}

export type UpcomingReservation = MyReservationBase & {
  status: 'UPCOMING'
}

export type VisitedReservationReviewActionState =
  | 'HIDDEN'
  | 'DELETED'
  | 'WRITTEN'
  | 'WRITABLE'
  | 'UNAVAILABLE'

export type VisitedReservation = MyReservationBase & {
  status: 'VISITED'
  reviewActionState: VisitedReservationReviewActionState
  hasReview: boolean
  isReviewable: boolean
  reviewId?: string | null
  reviewUnavailableReason?:
    | 'NOT_VISITED'
    | 'ALREADY_REVIEWED'
    | 'UNSUPPORTED_RESERVATION_TYPE'
    | null
  rating?: number | null
  earnedPoint?: number | null
}

export type CanceledReservation = MyReservationBase & {
  status: 'CANCELED'
}

export type MyReservation =
  | InProgressReservation
  | UpcomingReservation
  | VisitedReservation
  | CanceledReservation
