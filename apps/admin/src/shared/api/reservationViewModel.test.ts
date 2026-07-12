import { describe, expect, it } from 'vitest'
import {
  toReservationListView,
  toReservationUserView,
  toReservationView,
} from '@/shared/api/reservationViewModel'

describe('reservation view model', () => {
  it('preserves documented reservation and payment statuses', () => {
    const reservation = toReservationView({
      paymentStatus: 'CANCELED',
      reservationId: 3,
      reservationStatus: 'CANCELED',
    })

    expect(reservation).toMatchObject({
      id: 3,
      paymentStatus: 'CANCELED',
      reservationStatus: 'CANCELED',
    })
  })

  it('provides display-safe fallbacks for optional response fields', () => {
    expect(toReservationView({})).toEqual({
      adultCount: 0,
      amount: 0,
      childCount: 0,
      confirmDDay: 0,
      id: 0,
      paymentStatus: 'UNKNOWN',
      requestNote: '',
      reservationStatus: 'UNKNOWN',
      reservationType: 'UNKNOWN',
      reservedAt: '',
      reserverName: '-',
      restaurantAddress: '-',
      restaurantId: 0,
      restaurantImageUrl: '',
      restaurantName: '-',
      teenCount: 0,
      usedPoint: 0,
      userId: 0,
    })
  })

  it('normalizes reservation list pagination', () => {
    expect(
      toReservationListView({
        page: 2,
        reservations: [{ reservationId: 9 }],
        size: 20,
        totalCount: 41,
        totalPages: 3,
      }),
    ).toMatchObject({
      page: 2,
      reservations: [{ id: 9 }],
      size: 20,
      totalCount: 41,
      totalPages: 3,
    })
  })

  it('normalizes reservation user fields', () => {
    expect(toReservationUserView({ userId: 5, nickname: '해시' })).toEqual({
      birthDate: '-',
      email: '-',
      nameEng: '-',
      nickname: '해시',
      phone: '-',
      userId: 5,
    })
  })
})
