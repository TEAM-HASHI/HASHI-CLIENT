import type { VisitedReservation } from '@/features/review/api'
import type { MyReviewSummary } from '@/pages/myReviews/api/myReviewsApi'
import type {
  WritableReview,
  WrittenReview,
} from '@/pages/myReviews/types/myReview'

const requireNumber = (value: number | undefined, field: string) => {
  if (value === undefined) {
    throw new Error(`Missing review field: ${field}`)
  }

  return value
}

const formatVisitedAt = (value: string | undefined) => {
  if (!value) {
    return '방문 일시 정보 없음'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '방문 일시 정보 없음'
  }

  const parts = new Intl.DateTimeFormat('ko-KR', {
    day: 'numeric',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: 'numeric',
    timeZone: 'Asia/Seoul',
    year: 'numeric',
  }).formatToParts(date)
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''

  return `${getPart('year')}. ${getPart('month')}. ${getPart('day')} ${getPart('hour')}:${getPart('minute')} 방문`
}

const formatGuestSummary = ({
  adultCount = 0,
  teenCount = 0,
  childCount = 0,
}: VisitedReservation) => {
  const guests = [
    adultCount > 0 ? `어른 ${adultCount}명` : null,
    teenCount > 0 ? `청소년 ${teenCount}명` : null,
    childCount > 0 ? `어린이 ${childCount}명` : null,
  ].filter((guest): guest is string => guest !== null)

  return guests.length > 0 ? guests.join(' · ') : '인원 정보 없음'
}

export const toWritableReview = (
  reservation: VisitedReservation,
): WritableReview => {
  const reservationId = requireNumber(
    reservation.reservationId,
    'reservationId',
  )
  const restaurantId = requireNumber(reservation.restaurantId, 'restaurantId')

  return {
    guestSummary: formatGuestSummary(reservation),
    id: String(reservationId),
    reservationId: String(reservationId),
    restaurantId: String(restaurantId),
    restaurantName: reservation.restaurantName ?? '식당 정보 없음',
    thumbnailUrl: reservation.restaurantThumbnailUrl,
    visitedAt: formatVisitedAt(reservation.visitedAt),
  }
}

export const toWrittenReview = (review: MyReviewSummary): WrittenReview => {
  const reviewId = requireNumber(review.reviewId, 'reviewId')

  return {
    id: String(reviewId),
    rating: review.rating ?? 0,
    restaurantName: review.restaurantName ?? '식당 정보 없음',
    thumbnailUrl: review.restaurantThumbnailUrl,
    visitedAt: formatVisitedAt(review.visitedAt),
  }
}
