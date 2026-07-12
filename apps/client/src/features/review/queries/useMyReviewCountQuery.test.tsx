import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { getMyReviewCount } from '@/features/review/api'
import {
  myReviewQueryKeys,
  useMyReviewCountQuery,
} from '@/features/review/queries'

vi.mock('@/features/review/api', () => ({
  getMyReviewCount: vi.fn(),
}))

describe('useMyReviewCountQuery', () => {
  it('stores the review count under the shared count key', async () => {
    vi.mocked(getMyReviewCount).mockResolvedValue({ myReviewCount: 4 })
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useMyReviewCountQuery(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual({ myReviewCount: 4 })
    expect(queryClient.getQueryData(myReviewQueryKeys.count())).toEqual({
      myReviewCount: 4,
    })
  })
})
