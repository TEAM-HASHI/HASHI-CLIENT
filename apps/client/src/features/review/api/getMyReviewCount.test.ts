import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getMyReviewCount } from '@/features/review/api/getMyReviewCount'
import { request } from '@/shared/api/request'

vi.mock('@/shared/api/request', () => ({
  request: vi.fn(),
}))

const mockRequest = vi.mocked(request)

describe('getMyReviewCount', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('maps the current user review count', async () => {
    mockRequest.mockResolvedValue({ reviewCount: 8 })

    await expect(getMyReviewCount()).resolves.toEqual({
      myReviewCount: 8,
    })
    expect(mockRequest).toHaveBeenCalledWith('/api/v1/reviews/me/count')
  })

  it('throws when response data is missing', async () => {
    mockRequest.mockResolvedValue(null)

    await expect(getMyReviewCount()).rejects.toThrow(
      'Missing API response data: GET /api/v1/reviews/me/count',
    )
  })

  it('throws when review count is missing', async () => {
    mockRequest.mockResolvedValue({})

    await expect(getMyReviewCount()).rejects.toThrow(
      'Missing reviewCount: GET /api/v1/reviews/me/count',
    )
  })
})
