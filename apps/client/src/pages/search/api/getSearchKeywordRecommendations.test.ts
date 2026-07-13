import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getSearchKeywordRecommendations } from '@/pages/search/api/getSearchKeywordRecommendations'

const { mockRequest } = vi.hoisted(() => ({
  mockRequest: vi.fn(),
}))

vi.mock('@/shared/api/request', () => ({
  request: mockRequest,
}))

describe('getSearchKeywordRecommendations', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('requests recommended search keywords with size', async () => {
    mockRequest.mockResolvedValue({ keywords: ['스시', '라멘'] })

    await expect(getSearchKeywordRecommendations({ size: 8 })).resolves.toEqual(
      ['스시', '라멘'],
    )

    expect(mockRequest).toHaveBeenCalledWith(
      '/api/v1/restaurants/search-keyword-recommendations',
      {
        searchParams: { size: 8 },
      },
    )
  })
})
