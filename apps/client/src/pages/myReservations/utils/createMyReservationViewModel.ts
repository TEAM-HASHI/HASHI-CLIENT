import type { ReservationResponse } from '@/features/reservation'
import {
  formatReservationDate,
  formatReservationDateTime,
  formatReservationGuestSummary,
} from '@/features/reservation/utils/formatReservation'
import type { VisitedReservation as VisitedReservationResponse } from '@/features/review/api/getVisitedReservations'
import type {
  MyReservation,
  VisitedReservationReviewActionState,
} from '@/pages/myReservations/types'

const formatReservationDateTimeWithSuffix = (
  value: string | undefined,
  suffix: string,
) => {
  return `${formatReservationDateTime(value) ?? '-'} ${suffix}`
}

const formatReservationGuestSummaryWithFallback = ({
  adultCount,
  teenCount,
  childCount,
}: Pick<
  ReservationResponse | VisitedReservationResponse,
  'adultCount' | 'teenCount' | 'childCount'
>) => {
  return (
    formatReservationGuestSummary({
      adult: adultCount ?? 0,
      teen: teenCount ?? 0,
      child: childCount ?? 0,
    }) ?? '-'
  )
}

const createBaseReservation = (
  reservation: ReservationResponse,
): Omit<MyReservation, 'status'> | null => {
  if (!reservation.reservationId || !reservation.restaurantName) {
    return null
  }

  return {
    reservationId: String(reservation.reservationId),
    restaurantId:
      reservation.restaurantId === undefined
        ? ''
        : String(reservation.restaurantId),
    restaurantName: reservation.restaurantName,
    restaurantImageUrl: reservation.restaurantImageUrl ?? null,
    visitDateTime: formatReservationDateTimeWithSuffix(
      reservation.reservedAt,
      '방문',
    ),
    guestSummary: formatReservationGuestSummaryWithFallback(reservation),
  }
}

export const createMyReservationViewModel = (
  reservation: ReservationResponse,
): MyReservation | null => {
  const baseReservation = createBaseReservation(reservation)

  if (!baseReservation || !reservation.reservationStatus) {
    return null
  }

  if (reservation.reservationStatus === 'REQUESTED') {
    return {
      ...baseReservation,
      status: 'IN_PROGRESS',
      reservedAt: `${formatReservationDate(reservation.reservedAt) ?? '-'} 방문 예정`,
      remainingDays: reservation.confirmDDay ?? 0,
      progressStep: 'RECEIVED',
    }
  }

  if (reservation.reservationStatus === 'CONTACTING') {
    return {
      ...baseReservation,
      status: 'IN_PROGRESS',
      reservedAt: `${formatReservationDate(reservation.reservedAt) ?? '-'} 방문 예정`,
      remainingDays: reservation.confirmDDay ?? 0,
      progressStep: 'CONTACTING',
    }
  }

  if (reservation.reservationStatus === 'CONFIRMED') {
    return {
      ...baseReservation,
      status: 'UPCOMING',
      visitDateTime: formatReservationDateTimeWithSuffix(
        reservation.reservedAt,
        '방문 예정',
      ),
    }
  }

  if (reservation.reservationStatus === 'CANCELED') {
    return {
      ...baseReservation,
      status: 'CANCELED',
    }
  }

  return null
}

export const createMyVisitedReservationViewModel = (
  reservation: VisitedReservationResponse,
): MyReservation | null => {
  if (!reservation.reservationId || !reservation.restaurantName) {
    return null
  }

  const reviewActionState = getVisitedReservationReviewActionState(reservation)
  const hasReview = reviewActionState === 'WRITTEN'

  return {
    reservationId: String(reservation.reservationId),
    restaurantId:
      reservation.restaurantId === undefined ||
      reservation.restaurantId === null
        ? null
        : String(reservation.restaurantId),
    restaurantName: reservation.restaurantName,
    restaurantImageUrl: reservation.restaurantThumbnailUrl ?? null,
    visitDateTime: formatReservationDateTimeWithSuffix(
      reservation.visitedAt,
      '방문',
    ),
    guestSummary: formatReservationGuestSummaryWithFallback(reservation),
    status: 'VISITED',
    reviewActionState,
    hasReview,
    isReviewable: reviewActionState === 'WRITABLE',
    reviewId:
      reservation.reviewId === undefined || reservation.reviewId === null
        ? null
        : String(reservation.reviewId),
    reviewUnavailableReason: reservation.reviewUnavailableReason ?? null,
    rating: reservation.rating ?? null,
    earnedPoint: reservation.earnedPoint ?? null,
  }
}

const getVisitedReservationReviewActionState = (
  reservation: VisitedReservationResponse,
): VisitedReservationReviewActionState => {
  if (reservation.reviewUnavailableReason === 'UNSUPPORTED_RESERVATION_TYPE') {
    return 'HIDDEN'
  }

  if (reservation.reviewStatus === 'DELETED') {
    return 'DELETED'
  }

  const normalizedReviewStatus =
    reservation.reviewStatus ??
    (reservation.reviewId !== undefined && reservation.reviewId !== null
      ? 'REVIEWED'
      : 'UNREVIEWED')

  if (
    normalizedReviewStatus === 'REVIEWED' &&
    reservation.reviewId !== undefined &&
    reservation.reviewId !== null
  ) {
    return 'WRITTEN'
  }

  if (
    normalizedReviewStatus === 'UNREVIEWED' &&
    reservation.reviewable !== false &&
    reservation.restaurantId !== undefined &&
    reservation.restaurantId !== null
  ) {
    return 'WRITABLE'
  }

  return 'UNAVAILABLE'
}
