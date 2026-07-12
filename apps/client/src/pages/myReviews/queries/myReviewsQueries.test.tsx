import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getMyReviews } from '@/pages/myReviews/api/myReviewsApi'
import { useMyReviewsInfiniteQuery } from '@/pages/myReviews/queries/myReviewsQueries'

vi.mock('@/pages/myReviews/api/myReviewsApi', () => ({
  getMyReviews: vi.fn(),
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('myReviewsQueries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not request written reviews until its tab is enabled', async () => {
    vi.mocked(getMyReviews).mockResolvedValue({
      content: [],
      hasNext: false,
    })
    const { result, rerender } = renderHook(
      ({ enabled }) => useMyReviewsInfiniteQuery(enabled),
      { initialProps: { enabled: false }, wrapper: createWrapper() },
    )

    expect(result.current.fetchStatus).toBe('idle')
    expect(getMyReviews).not.toHaveBeenCalled()

    rerender({ enabled: true })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(getMyReviews).toHaveBeenCalledWith({
      cursor: undefined,
      size: 20,
    })
  })
})
