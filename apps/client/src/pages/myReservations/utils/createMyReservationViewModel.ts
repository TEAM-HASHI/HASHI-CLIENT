import type { ReservationResponse } from '@/features/reservation'
import type { VisitedReservation as VisitedReservationResponse } from '@/features/review/api/getVisitedReservations'
import type { MyReservation } from '@/pages/myReservations/types'
import { formatDotDateTime } from '@/shared/utils'

const createDate = (value: string | undefined) => {
  if (!value) {
    return null
  }

  return new Date(value)
}

const formatReservationDateTime = (
  value: string | undefined,
  suffix: string,
) => {
  const date = createDate(value)

  if (!date) {
    return `- ${suffix}`
  }

  return `${formatDotDateTime(date)} ${suffix}`
}

const formatReservationDate = (value: string | undefined, suffix: string) => {
  const date = createDate(value)

  if (!date) {
    return `- ${suffix}`
  }

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${year}.${month}.${day} ${suffix}`
}

const formatPeopleCount = ({
  adultCount,
  teenCount,
  childCount,
}: Pick<
  ReservationResponse | VisitedReservationResponse,
  'adultCount' | 'teenCount' | 'childCount'
>) => {
  const countItems = [
    { label: '어른', count: adultCount ?? 0 },
    { label: '청소년', count: teenCount ?? 0 },
    { label: '어린이', count: childCount ?? 0 },
  ].filter((item) => item.count > 0)

  if (countItems.length === 0) {
    return '-'
  }

  return countItems.map((item) => `${item.label} ${item.count}명`).join(', ')
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
    visitDateTime: formatReservationDateTime(reservation.reservedAt, '방문'),
    guestSummary: formatPeopleCount(reservation),
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
      requestedAt: formatReservationDate(reservation.reservedAt, '예약 신청'),
      remainingDays: reservation.confirmDDay ?? 0,
      progressStep: 'RECEIVED',
    }
  }

  if (reservation.reservationStatus === 'CONTACTING') {
    return {
      ...baseReservation,
      status: 'IN_PROGRESS',
      requestedAt: formatReservationDate(reservation.reservedAt, '예약 신청'),
      remainingDays: reservation.confirmDDay ?? 0,
      progressStep: 'CONTACTING',
    }
  }

  if (reservation.reservationStatus === 'CONFIRMED') {
    return {
      ...baseReservation,
      status: 'UPCOMING',
      visitDateTime: formatReservationDateTime(
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
  if (
    !reservation.reservationId ||
    !reservation.restaurantId ||
    !reservation.restaurantName
  ) {
    return null
  }

  return {
    reservationId: String(reservation.reservationId),
    restaurantId: String(reservation.restaurantId),
    restaurantName: reservation.restaurantName,
    restaurantImageUrl: reservation.restaurantThumbnailUrl ?? null,
    visitDateTime: formatReservationDateTime(reservation.visitedAt, '방문'),
    guestSummary: formatPeopleCount(reservation),
    status: 'VISITED',
    hasReview:
      reservation.reviewId !== undefined && reservation.reviewId !== null,
    reviewId:
      reservation.reviewId === undefined || reservation.reviewId === null
        ? null
        : String(reservation.reviewId),
    rating: reservation.rating ?? null,
    earnedPoint: reservation.earnedPoint ?? null,
  }
}
