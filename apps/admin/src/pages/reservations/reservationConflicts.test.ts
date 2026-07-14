import { describe, expect, it } from 'vitest'
import { getReservationConflictCounts } from '@/pages/reservations/reservationConflicts'
import type { AdminReservationView } from '@/shared/api/reservationViewModel'

const createReservation = (
  overrides: Partial<AdminReservationView> = {},
): AdminReservationView => ({
  adultCount: 2,
  amount: 30_000,
  childCount: 0,
  confirmDDay: 3,
  id: 91,
  paymentStatus: 'PAID',
  requestNote: '',
  reservationStatus: 'REQUESTED',
  reservationType: 'STANDARD',
  reservedAt: '2026-07-20T18:30:00',
  reserverName: '김하시',
  restaurantAddress: '도쿄도 시부야구',
  restaurantId: 7,
  restaurantImageUrl: '',
  restaurantName: '하시 스시',
  teenCount: 0,
  usedPoint: 0,
  userId: 3,
  ...overrides,
})

describe('getReservationConflictCounts', () => {
  it('counts active reservations for the same restaurant in the same minute', () => {
    const conflicts = getReservationConflictCounts([
      createReservation(),
      createReservation({
        id: 92,
        reservationStatus: 'CONFIRMED',
        reservedAt: '2026-07-20T18:30:59',
      }),
    ])

    expect([...conflicts]).toEqual([
      [91, 2],
      [92, 2],
    ])
  })

  it('ignores canceled, other restaurant, other minute, and invalid reservations', () => {
    const conflicts = getReservationConflictCounts([
      createReservation(),
      createReservation({ id: 92, reservationStatus: 'CANCELED' }),
      createReservation({ id: 93, restaurantId: 8 }),
      createReservation({ id: 94, reservedAt: '2026-07-20T18:31:00' }),
      createReservation({ id: 95, restaurantId: 0 }),
      createReservation({ id: 96, reservedAt: '' }),
    ])

    expect([...conflicts]).toEqual([])
  })
})
