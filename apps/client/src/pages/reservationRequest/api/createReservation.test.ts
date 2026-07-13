import { beforeEach, describe, expect, it, vi } from 'vitest'

import { request } from '@/shared/api'

import { createReservation } from '@/pages/reservationRequest/api/createReservation'

vi.mock('@/shared/api', () => ({
  request: vi.fn(),
}))

const mockedRequest = vi.mocked(request)

describe('createReservation', () => {
  beforeEach(() => {
    mockedRequest.mockReset()
    mockedRequest.mockResolvedValue({ reservationId: 31 })
  })

  it('creates a standard reservation with the OpenAPI request shape', async () => {
    await createReservation({
      draft: {
        source: 'restaurant',
        restaurantId: '10',
        restaurantName: '하시 스시',
        restaurantAddress: '도쿄도 주오구 긴자 1-1',
        restaurantImageUrl: 'https://example.com/restaurant.webp',
        reservationFee: 5_000,
        guestName: '김하시',
        guests: { adult: 2, teen: 1, child: 0 },
        date: '2026-08-01',
        time: '19:00',
        requestNote: '창가 자리 부탁드립니다',
      },
      usedPoint: 1_000,
    })

    expect(mockedRequest).toHaveBeenCalledWith('/api/v1/reservations', {
      json: {
        reserverName: '김하시',
        restaurantId: 10,
        reservedAt: '2026-08-01T19:00:00',
        adultCount: 2,
        teenCount: 1,
        childCount: 0,
        requestNote: '창가 자리 부탁드립니다',
        usedPoint: 1_000,
        amount: 4_000,
      },
      method: 'post',
    })
  })

  it('creates an anywhere reservation and omits an empty request note', async () => {
    await createReservation({
      draft: {
        source: 'anywhere',
        restaurantId: null,
        restaurantName: '동네 골목 이자카야',
        restaurantAddress: '도쿄도 도시마구 1-1-1',
        restaurantImageUrl: null,
        guestName: '김하시',
        guests: { adult: 1, teen: 0, child: 1 },
        date: '2026-08-02',
        time: '18:30',
        requestNote: '   ',
      },
      usedPoint: 0,
    })

    expect(mockedRequest).toHaveBeenCalledWith(
      '/api/v1/reservations/anywhere',
      {
        json: {
          reserverName: '김하시',
          restaurantName: '동네 골목 이자카야',
          restaurantAddress: '도쿄도 도시마구 1-1-1',
          reservedAt: '2026-08-02T18:30:00',
          adultCount: 1,
          teenCount: 0,
          childCount: 1,
          usedPoint: 0,
          amount: 4_000,
        },
        method: 'post',
      },
    )
  })

  it('returns the created reservation id', async () => {
    await expect(
      createReservation({
        draft: {
          restaurantId: '10',
          restaurantName: '하시 스시',
          restaurantAddress: '도쿄도 주오구 긴자 1-1',
          restaurantImageUrl: null,
          reservationFee: 4_000,
          guestName: '김하시',
          guests: { adult: 1, teen: 0, child: 0 },
          date: '2026-08-01',
          time: '19:00',
          requestNote: '',
        },
        usedPoint: 0,
      }),
    ).resolves.toEqual({ reservationId: 31 })
  })

  it('rejects a non-numeric restaurant id before sending the request', async () => {
    await expect(
      createReservation({
        draft: {
          restaurantId: 'default',
          restaurantName: '하시 스시',
          restaurantAddress: '도쿄도 주오구 긴자 1-1',
          restaurantImageUrl: null,
          reservationFee: 4_000,
          guestName: '김하시',
          guests: { adult: 1, teen: 0, child: 0 },
          date: '2026-08-01',
          time: '19:00',
          requestNote: '',
        },
        usedPoint: 0,
      }),
    ).rejects.toThrow('유효하지 않은 식당 ID입니다.')

    expect(mockedRequest).not.toHaveBeenCalled()
  })

  it('rejects a response without a reservation id', async () => {
    mockedRequest.mockResolvedValue({})

    await expect(
      createReservation({
        draft: {
          restaurantId: '10',
          restaurantName: '하시 스시',
          restaurantAddress: '도쿄도 주오구 긴자 1-1',
          restaurantImageUrl: null,
          reservationFee: 4_000,
          guestName: '김하시',
          guests: { adult: 1, teen: 0, child: 0 },
          date: '2026-08-01',
          time: '19:00',
          requestNote: '',
        },
        usedPoint: 0,
      }),
    ).rejects.toThrow('예약 생성 응답에 예약 ID가 없습니다.')
  })
})
