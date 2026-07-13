import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getMyReservations } from '@/pages/myReservations/api/getMyReservations'
import { request } from '@/shared/api/request'

vi.mock('@/shared/api/request', () => ({
  request: vi.fn(),
}))

const mockedRequest = vi.mocked(request)

describe('getMyReservations', () => {
  beforeEach(() => {
    mockedRequest.mockReset()
  })

  it('requests current user reservations with status, cursor, and size', async () => {
    const reservationListResponse = {
      reservations: [
        {
          reservationId: 12,
          restaurantName: '스시 하시',
          reservationStatus: 'REQUESTED',
        },
      ],
      nextCursor: 10,
      hasNext: true,
      totalCount: 12,
    }

    mockedRequest.mockResolvedValue(reservationListResponse)

    await expect(
      getMyReservations({
        cursor: 5,
        size: 10,
        status: 'IN_PROGRESS',
      }),
    ).resolves.toEqual(reservationListResponse)

    expect(mockedRequest).toHaveBeenCalledWith('/api/v1/reservations/me', {
      searchParams: {
        cursor: 5,
        size: 10,
        status: 'IN_PROGRESS',
      },
    })
  })

  it('falls back to an empty reservation page when response data is empty', async () => {
    mockedRequest.mockResolvedValue(null)

    await expect(
      getMyReservations({
        size: 10,
        status: 'UPCOMING',
      }),
    ).resolves.toEqual({
      reservations: [],
      hasNext: false,
      totalCount: 0,
    })
  })
})
