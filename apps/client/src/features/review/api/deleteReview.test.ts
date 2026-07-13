import { beforeEach, describe, expect, it, vi } from 'vitest'

import { deleteReview } from '@/features/review/api/deleteReview'
import { request } from '@/shared/api/request'

vi.mock('@/shared/api/request', () => ({ request: vi.fn() }))

const mockRequest = vi.mocked(request)

describe('deleteReview', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('deletes the selected review', async () => {
    mockRequest.mockResolvedValue(null)

    await deleteReview(31)

    expect(mockRequest).toHaveBeenCalledWith('api/v1/reviews/31', {
      method: 'delete',
    })
  })
})
