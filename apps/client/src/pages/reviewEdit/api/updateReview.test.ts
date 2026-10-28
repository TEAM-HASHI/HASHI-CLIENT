import { beforeEach, describe, expect, it, vi } from 'vitest'

import { updateReview } from '@/pages/reviewEdit/api/updateReview'
import { request } from '@/shared/api/request'

vi.mock('@/shared/api/request', () => ({ request: vi.fn() }))

beforeEach(() => {
  vi.mocked(request).mockReset()
})

describe('updateReview', () => {
  it('sends the final review state and accepts a void response', async () => {
    vi.mocked(request).mockResolvedValue(null)
    const body = {
      rating: 5,
      keywordCodes: ['FOOD_IS_DELICIOUS'],
      content: '다시 방문하고 싶은 식당이에요.',
      imageFileKeys: [],
    }

    await expect(updateReview(5, body)).resolves.toBeUndefined()
    expect(request).toHaveBeenCalledWith('/api/v1/reviews/5', {
      method: 'patch',
      json: body,
    })
  })
})
