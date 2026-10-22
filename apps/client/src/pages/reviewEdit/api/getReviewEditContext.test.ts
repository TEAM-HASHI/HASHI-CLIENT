import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getReviewEditContext } from '@/pages/reviewEdit/api/getReviewEditContext'
import { request } from '@/shared/api/request'

vi.mock('@/shared/api/request', () => ({ request: vi.fn() }))

beforeEach(() => {
  vi.mocked(request).mockReset()
})

describe('getReviewEditContext', () => {
  it('uses the dedicated edit-context endpoint', async () => {
    const context = {
      reviewId: 5,
      images: [
        {
          fileKey: 'uploads/reviews/first.jpg',
          imageUrl: 'https://cdn.hashi.kr/first.jpg',
          displayOrder: 0,
        },
      ],
    }
    vi.mocked(request).mockResolvedValue(context)

    await expect(getReviewEditContext(5)).resolves.toEqual(context)
    expect(request).toHaveBeenCalledWith('/api/v1/reviews/me/5/edit-context')
  })

  it.each([
    null,
    { reviewId: 5 },
    { reviewId: 5, images: [{ imageUrl: 'https://cdn.hashi.kr/first.jpg' }] },
    { reviewId: 5, images: [{ fileKey: 'uploads/reviews/first.jpg' }] },
    {
      reviewId: 5,
      images: Array.from({ length: 11 }, (_, index) => ({
        fileKey: `uploads/reviews/${index}.jpg`,
        imageUrl: `https://cdn.hashi.kr/${index}.jpg`,
      })),
    },
  ])(
    'rejects incomplete edit context so saving cannot erase photos',
    async (data) => {
      vi.mocked(request).mockResolvedValue(data)

      await expect(getReviewEditContext(5)).rejects.toThrow()
    },
  )
})
