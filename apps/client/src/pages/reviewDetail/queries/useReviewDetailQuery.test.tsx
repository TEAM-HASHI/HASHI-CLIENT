import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { myReviewQueryKeys } from '@/features/review/queries/myReviewQueryKeys'
import { getMyReviewDetail } from '@/pages/reviewDetail/api/getMyReviewDetail'
import { useReviewDetailQuery } from '@/pages/reviewDetail/queries/useReviewDetailQuery'

vi.mock('@/pages/reviewDetail/api/getMyReviewDetail', () => ({
  getMyReviewDetail: vi.fn(),
}))

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

describe('useReviewDetailQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses a detail key and requests a valid review ID', async () => {
    vi.mocked(getMyReviewDetail).mockResolvedValue({ reviewId: 5 })
    const { result } = renderHook(() => useReviewDetailQuery(5), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(myReviewQueryKeys.detail(5)).toEqual(['myReviews', 'detail', 5])
    expect(getMyReviewDetail).toHaveBeenCalledWith(5)
  })

  it('does not request without a valid review ID', () => {
    const { result } = renderHook(() => useReviewDetailQuery(null), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(getMyReviewDetail).not.toHaveBeenCalled()
  })
})
