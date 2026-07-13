import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { deleteReview } from '@/features/review/api/deleteReview'
import { useDeleteReviewMutation } from '@/features/review/mutations/useDeleteReviewMutation'
import { myReviewQueryKeys } from '@/features/review/queries/myReviewQueryKeys'
import { visitedReservationQueryKeys } from '@/features/review/queries/visitedReservationQueryKeys'

vi.mock('@/features/review/api/deleteReview', () => ({
  deleteReview: vi.fn(),
}))

describe('useDeleteReviewMutation', () => {
  it('invalidates review lists and removes the deleted review detail', async () => {
    vi.mocked(deleteReview).mockResolvedValue(null)
    const queryClient = new QueryClient()
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    queryClient.setQueryData(myReviewQueryKeys.detail(31), { reviewId: 31 })
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useDeleteReviewMutation(), {
      wrapper,
    })

    await act(() => result.current.mutateAsync(31))

    expect(deleteReview).toHaveBeenCalledWith(31, expect.anything())
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: myReviewQueryKeys.lists(),
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: visitedReservationQueryKeys.all,
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: myReviewQueryKeys.count(),
    })
    expect(invalidateQueries).toHaveBeenCalledTimes(3)
    expect(
      queryClient.getQueryData(myReviewQueryKeys.detail(31)),
    ).toBeUndefined()
  })
})
