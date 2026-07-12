import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getMyReviewCount } from '@/pages/mypage/api/getMyReviewCount'
import { request } from '@/shared/api/request'

vi.mock('@/shared/api/request', () => ({
  request: vi.fn(),
}))

const mockRequest = vi.mocked(request)

describe('getMyReviewCount', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('maps current user review count to myReviewCount', async () => {
    mockRequest.mockResolvedValue({ reviewCount: 8 })

    await expect(getMyReviewCount()).resolves.toEqual({
      myReviewCount: 8,
    })
    expect(mockRequest).toHaveBeenCalledWith('/api/v1/reviews/me/count')
  })

  it('falls back to 0 when review count is empty', async () => {
    mockRequest.mockResolvedValue(null)

    await expect(getMyReviewCount()).resolves.toEqual({
      myReviewCount: 0,
    })
  })
})
