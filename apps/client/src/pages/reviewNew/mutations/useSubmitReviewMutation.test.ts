import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { createElement, type PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { pointQueryKeys } from '@/features/point/queries/pointQueryKeys'
import { myReviewQueryKeys } from '@/features/review/queries/myReviewQueryKeys'
import { restaurantDetailQueryKeys } from '@/features/restaurantDetail/queries/restaurantDetailQueryKeys'
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
        restaurantId: 1,
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
        restaurantId: 1,
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
  it('refetches fresh point and count caches on reentry after a successful review', async () => {
    uploadReviewImagesMock.mockResolvedValue([])
    createReviewMock.mockResolvedValue({ reviewId: 501, earnedPoint: 100 })
    const queryClient = new QueryClient({
      defaultOptions: { queries: { staleTime: 30_000, retry: false } },
    })
    queryClient.setQueryData(pointQueryKeys.myBalance(), {
      availablePoint: 7000,
    })
    queryClient.setQueryData(myReviewQueryKeys.count(), { myReviewCount: 8 })
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(QueryClientProvider, { client: queryClient }, children)
    const mutation = renderHook(() => useSubmitReviewMutation(), { wrapper })

    await act(() =>
      mutation.result.current.mutateAsync({
        reservationId: 23,
        rating: 5,
        keywordCodes: ['FOOD_IS_DELICIOUS'],
        content: '음식도 맛있고 직원분도 친절했어요.',
        photoFiles: [],
      }),
    )

    expect(
      queryClient.getQueryState(pointQueryKeys.myBalance())?.isInvalidated,
    ).toBe(true)
    expect(
      queryClient.getQueryState(myReviewQueryKeys.count())?.isInvalidated,
    ).toBe(true)
    const getPoint = vi.fn().mockResolvedValue({ availablePoint: 7100 })
    const getCount = vi.fn().mockResolvedValue({ myReviewCount: 9 })
    const summary = renderHook(
      () => ({
        point: useQuery({
          queryKey: pointQueryKeys.myBalance(),
          queryFn: getPoint,
        }),
        count: useQuery({
          queryKey: myReviewQueryKeys.count(),
          queryFn: getCount,
        }),
      }),
      { wrapper },
    )

    await waitFor(() => {
      expect(summary.result.current.point.data).toEqual({
        availablePoint: 7100,
      })
      expect(summary.result.current.count.data).toEqual({ myReviewCount: 9 })
    })
    expect(getPoint).toHaveBeenCalledTimes(1)
    expect(getCount).toHaveBeenCalledTimes(1)
    summary.unmount()
    mutation.unmount()
    queryClient.clear()
  })

  it('keeps point and count caches when review submission fails', async () => {
    uploadReviewImagesMock.mockResolvedValue([])
    createReviewMock.mockRejectedValue(new Error('request failed'))
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    })
    queryClient.setQueryData(pointQueryKeys.myBalance(), {
      availablePoint: 7000,
    })
    queryClient.setQueryData(myReviewQueryKeys.count(), { myReviewCount: 8 })
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(QueryClientProvider, { client: queryClient }, children)
    const { result, unmount } = renderHook(() => useSubmitReviewMutation(), {
      wrapper,
    })

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          reservationId: 23,
          rating: 5,
          keywordCodes: ['FOOD_IS_DELICIOUS'],
          content: '음식도 맛있고 직원분도 친절했어요.',
          photoFiles: [],
        }),
      ).rejects.toThrow('request failed')
    })

    expect(
      queryClient.getQueryState(pointQueryKeys.myBalance())?.isInvalidated,
    ).toBe(false)
    expect(
      queryClient.getQueryState(myReviewQueryKeys.count())?.isInvalidated,
    ).toBe(false)
    unmount()
    queryClient.clear()
  })

  it('invalidates review context and related review caches after submitting a review', async () => {
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
        restaurantId: 1,
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
      queryKey: myReviewQueryKeys.count(),
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: myReviewQueryKeys.lists(),
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: restaurantDetailQueryKeys.detail(1),
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: visitedReservationQueryKeys.all,
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: pointQueryKeys.myBalance(),
    })
    expect(invalidateQueries).toHaveBeenCalledTimes(6)
  })
})
