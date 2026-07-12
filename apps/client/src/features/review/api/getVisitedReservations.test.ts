import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getVisitedReservations } from '@/features/review/api/getVisitedReservations'
import { request } from '@/shared/api'

vi.mock('@/shared/api', () => ({
  request: vi.fn(),
}))

const mockRequest = vi.mocked(request)

describe('getVisitedReservations', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('forwards every supported filter to the shared endpoint', async () => {
    mockRequest.mockResolvedValue({
      content: [],
      hasNext: false,
      totalCount: 0,
    })

    await getVisitedReservations({
      cursor: 23,
      restaurantId: 7,
      reviewStatus: 'unreviewed',
      size: 1,
      sort: 'oldest',
    })

    expect(mockRequest).toHaveBeenCalledWith(
      'api/v1/reviews/visited-reservations',
      {
        searchParams: {
          cursor: 23,
          restaurantId: 7,
          reviewStatus: 'unreviewed',
          size: 1,
          sort: 'oldest',
        },
      },
    )
  })

  it('supports the reviewed filter used for written review counts', async () => {
    mockRequest.mockResolvedValue({
      content: [],
      hasNext: false,
      totalCount: 4,
    })

    await getVisitedReservations({ reviewStatus: 'reviewed', size: 1 })

    expect(mockRequest).toHaveBeenCalledWith(
      'api/v1/reviews/visited-reservations',
      {
        searchParams: {
          cursor: undefined,
          restaurantId: undefined,
          reviewStatus: 'reviewed',
          size: 1,
          sort: undefined,
        },
      },
    )
  })
})
