import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getMyReviewDetail } from '@/pages/reviewDetail/api/getMyReviewDetail'
import { request } from '@/shared/api'

vi.mock('@/shared/api', () => ({ request: vi.fn() }))

const mockRequest = vi.mocked(request)

describe('getMyReviewDetail', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('requests the signed-in user review by ID', async () => {
    mockRequest.mockResolvedValue({ reviewId: 5 })

    await getMyReviewDetail(5)

    expect(mockRequest).toHaveBeenCalledWith('api/v1/reviews/me/5')
  })
})
