import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getMyReviews } from '@/pages/myReviews/api/myReviewsApi'
import { request } from '@/shared/api'

vi.mock('@/shared/api', () => ({
  request: vi.fn(),
}))

const mockRequest = vi.mocked(request)

describe('myReviewsApi', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('requests the current user reviews with cursor pagination', async () => {
    mockRequest.mockResolvedValue({ content: [], hasNext: false })

    await getMyReviews({ cursor: 11, size: 20 })

    expect(mockRequest).toHaveBeenCalledWith('api/v1/reviews/me', {
      searchParams: { cursor: 11, size: 20 },
    })
  })
})
