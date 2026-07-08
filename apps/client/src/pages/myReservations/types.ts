import type { ReservationStatusFilterValue } from '@/pages/myReservations/constants/reservationStatus'

type MyReservationBase = {
  reservationId: string
  restaurantId: string
  restaurantName: string
  restaurantImageUrl?: string | null
  visitDateTime: string
  guestSummary: string
  status: ReservationStatusFilterValue
}

export type InProgressReservation = MyReservationBase & {
  status: 'IN_PROGRESS'
  requestedAt: string
  remainingDays: number
  progressStep: 'RECEIVED' | 'CONTACTING' | 'CONFIRMED'
}

export type UpcomingReservation = MyReservationBase & {
  status: 'UPCOMING'
}

export type VisitedReservation = MyReservationBase & {
  status: 'VISITED'
  hasReview: boolean
  reviewId?: string | null
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
