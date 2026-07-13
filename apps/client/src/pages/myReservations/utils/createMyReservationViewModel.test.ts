import { describe, expect, it } from 'vitest'

import {
  createMyReservationViewModel,
  createMyVisitedReservationViewModel,
} from '@/pages/myReservations/utils/createMyReservationViewModel'

describe('createMyReservationViewModel', () => {
  it('maps requested reservations to in-progress cards', () => {
    expect(
      createMyReservationViewModel({
        reservationId: 12,
        restaurantId: 34,
        restaurantName: '스시 하시',
        restaurantImageUrl: 'https://example.com/sushi.jpg',
        reservedAt: '2026-07-20T18:30:00',
        adultCount: 2,
        teenCount: 1,
        childCount: 0,
        reservationStatus: 'REQUESTED',
        confirmDDay: 3,
      }),
    ).toEqual({
      reservationId: '12',
      restaurantId: '34',
      restaurantName: '스시 하시',
      restaurantImageUrl: 'https://example.com/sushi.jpg',
      visitDateTime: '2026.7.20. 18:30 방문',
      guestSummary: '어른 2명, 청소년 1명',
      status: 'IN_PROGRESS',
      requestedAt: '2026.7.20 예약 신청',
      remainingDays: 3,
      progressStep: 'RECEIVED',
    })
  })

  it('maps confirmed reservations to upcoming cards', () => {
    expect(
      createMyReservationViewModel({
        reservationId: 13,
        restaurantId: 35,
        restaurantName: '라멘 하시',
        reservedAt: '2026-07-21T12:00:00',
        adultCount: 1,
        reservationStatus: 'CONFIRMED',
      }),
    ).toMatchObject({
      reservationId: '13',
      restaurantId: '35',
      restaurantName: '라멘 하시',
      visitDateTime: '2026.7.21. 12:00 방문 예정',
      guestSummary: '어른 1명',
      status: 'UPCOMING',
    })
  })

  it('returns null when the reservation status is unsupported for the current API scope', () => {
    expect(
      createMyReservationViewModel({
        reservationId: 14,
        restaurantName: '방문 완료 식당',
        reservationStatus: 'VISITED',
      }),
    ).toBeNull()
  })

  it('maps visited reservations to visited cards', () => {
    expect(
      createMyVisitedReservationViewModel({
        reservationId: 31,
        restaurantId: 41,
        restaurantName: '방문한 스시',
        restaurantThumbnailUrl: 'https://example.com/visited.png',
        visitedAt: '2026-07-10T18:30:00',
        adultCount: 2,
        reviewId: 51,
        rating: 4,
        earnedPoint: 300,
      }),
    ).toEqual({
      reservationId: '31',
      restaurantId: '41',
      restaurantName: '방문한 스시',
      restaurantImageUrl: 'https://example.com/visited.png',
      visitDateTime: '2026.7.10. 18:30 방문',
      guestSummary: '어른 2명',
      status: 'VISITED',
      hasReview: true,
      reviewId: '51',
      rating: 4,
      earnedPoint: 300,
    })
  })
})
