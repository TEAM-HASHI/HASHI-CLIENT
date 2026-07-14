import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { createElement, type PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { visitedReservationQueryKeys } from '@/features/review/queries/visitedReservationQueryKeys'
import {
  submitReview,
  useSubmitReviewMutation,
} from '@/pages/reviewNew/mutations/useSubmitReviewMutation'
import { reviewNewQueryKeys } from '@/pages/reviewNew/queries/reviewNewQueryKeys'

const { createReviewMock, uploadReviewImagesMock } = vi.hoisted(() => ({
  createReviewMock: vi.fn(),
  uploadReviewImagesMock: vi.fn(),
}))

vi.mock('@/pages/reviewNew/api/createReview', () => ({
  createReview: createReviewMock,
}))

vi.mock('@/pages/reviewNew/api/uploadReviewImages', () => ({
  uploadReviewImages: uploadReviewImagesMock,
}))

beforeEach(() => {
  createReviewMock.mockReset()
  uploadReviewImagesMock.mockReset()
})

describe('submitReview', () => {
  it('creates the review after converting photos to image file keys', async () => {
    const photoFiles = [
      new File(['image'], 'review.jpg', { type: 'image/jpeg' }),
    ]
    uploadReviewImagesMock.mockResolvedValue(['uploads/reviews/review.jpg'])
    createReviewMock.mockResolvedValue({ reviewId: 501, earnedPoint: 100 })

    await expect(
      submitReview({
        reservationId: 23,
        rating: 5,
        keywordCodes: ['FOOD_IS_DELICIOUS'],
        content: '음식도 맛있고 직원분도 친절했어요.',
        photoFiles,
      }),
    ).resolves.toEqual({ reviewId: 501, earnedPoint: 100 })
    expect(createReviewMock).toHaveBeenCalledWith({
      reservationId: 23,
      rating: 5,
      keywordCodes: ['FOOD_IS_DELICIOUS'],
      content: '음식도 맛있고 직원분도 친절했어요.',
      imageFileKeys: ['uploads/reviews/review.jpg'],
    })
  })

  it('does not create a review when image upload fails', async () => {
    uploadReviewImagesMock.mockRejectedValue(new Error('upload failed'))

    await expect(
      submitReview({
        reservationId: 23,
        rating: 5,
        keywordCodes: ['FOOD_IS_DELICIOUS'],
        content: '음식도 맛있고 직원분도 친절했어요.',
        photoFiles: [new File(['image'], 'review.jpg', { type: 'image/jpeg' })],
      }),
    ).rejects.toThrow('upload failed')
    expect(createReviewMock).not.toHaveBeenCalled()
  })
})

describe('useSubmitReviewMutation', () => {
  it('invalidates review context and visited reservation caches after submitting a review', async () => {
    uploadReviewImagesMock.mockResolvedValue([])
    createReviewMock.mockResolvedValue({ reviewId: 501, earnedPoint: 100 })
    const queryClient = new QueryClient()
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(QueryClientProvider, { client: queryClient }, children)
    const { result } = renderHook(() => useSubmitReviewMutation(), {
      wrapper,
    })

    await act(() =>
      result.current.mutateAsync({
        reservationId: 23,
        rating: 5,
        keywordCodes: ['FOOD_IS_DELICIOUS'],
        content: '음식도 맛있고 직원분도 친절했어요.',
        photoFiles: [],
      }),
    )

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: reviewNewQueryKeys.context(23),
      refetchType: 'none',
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: visitedReservationQueryKeys.all,
    })
    expect(invalidateQueries).toHaveBeenCalledTimes(2)
  })
})
