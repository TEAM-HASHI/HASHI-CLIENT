import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { createElement, type PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { restaurantDetailQueryKeys } from '@/features/restaurantDetail/queries/restaurantDetailQueryKeys'
import { restaurantPhotoQueryKeys } from '@/features/restaurantDetail/queries/restaurantPhotoQueryOptions'
import { uploadReviewImages } from '@/features/review/api/uploadReviewImages'
import { myReviewQueryKeys } from '@/features/review/queries/myReviewQueryKeys'
import { updateReview } from '@/pages/reviewEdit/api/updateReview'
import {
  submitReviewUpdate,
  useUpdateReviewMutation,
} from '@/pages/reviewEdit/mutations/useUpdateReviewMutation'

vi.mock('@/features/review/api/uploadReviewImages', () => ({
  uploadReviewImages: vi.fn(),
}))
vi.mock('@/pages/reviewEdit/api/updateReview', () => ({
  updateReview: vi.fn(),
}))

beforeEach(() => {
  vi.mocked(uploadReviewImages).mockReset()
  vi.mocked(updateReview).mockReset()
})

const variables = {
  reviewId: 5,
  restaurantId: 9,
  rating: 4,
  keywordCodes: ['FOOD_IS_DELICIOUS'],
  content: '리뷰를 수정한 내용입니다.',
  existingImageFileKeys: ['uploads/reviews/kept.jpg'],
  photoFiles: [new File(['image'], 'new.jpg', { type: 'image/jpeg' })],
}

describe('submitReviewUpdate', () => {
  it('uploads only new files, then submits retained and new keys in order', async () => {
    vi.mocked(uploadReviewImages).mockResolvedValue(['uploads/reviews/new.jpg'])
    vi.mocked(updateReview).mockResolvedValue(undefined)

    await submitReviewUpdate(variables)

    expect(uploadReviewImages).toHaveBeenCalledWith(variables.photoFiles)
    expect(updateReview).toHaveBeenCalledWith(5, {
      rating: 4,
      keywordCodes: ['FOOD_IS_DELICIOUS'],
      content: '리뷰를 수정한 내용입니다.',
      imageFileKeys: ['uploads/reviews/kept.jpg', 'uploads/reviews/new.jpg'],
    })
  })

  it('does not patch when image upload fails', async () => {
    vi.mocked(uploadReviewImages).mockRejectedValue(new Error('upload failed'))

    await expect(submitReviewUpdate(variables)).rejects.toThrow('upload failed')
    expect(updateReview).not.toHaveBeenCalled()
  })
})

describe('useUpdateReviewMutation', () => {
  it('refreshes cached edit context and inactive detail before saving completes', async () => {
    vi.mocked(uploadReviewImages).mockResolvedValue([])
    vi.mocked(updateReview).mockResolvedValue(undefined)
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: 30_000 } },
    })
    const oldContext = { reviewId: 5, content: '이전 리뷰', images: [] }
    const newContext = { reviewId: 5, content: '수정한 리뷰', images: [] }
    const oldDetail = { reviewId: 5, content: '이전 리뷰' }
    const newDetail = { reviewId: 5, content: '수정한 리뷰' }
    let serverContext = oldContext
    let serverDetail = oldDetail
    const getContext = vi.fn(async () => serverContext)
    const getDetail = vi.fn(async () => serverDetail)

    await queryClient.prefetchQuery({
      queryKey: myReviewQueryKeys.editContext(5),
      queryFn: getContext,
    })
    await queryClient.prefetchQuery({
      queryKey: myReviewQueryKeys.detail(5),
      queryFn: getDetail,
    })
    serverContext = newContext
    serverDetail = newDetail

    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(QueryClientProvider, { client: queryClient }, children)
    const { result } = renderHook(() => useUpdateReviewMutation(), { wrapper })

    await act(() =>
      result.current.mutateAsync({ ...variables, photoFiles: [] }),
    )

    expect(queryClient.getQueryData(myReviewQueryKeys.editContext(5))).toEqual(
      newContext,
    )
    expect(queryClient.getQueryData(myReviewQueryKeys.detail(5))).toEqual(
      newDetail,
    )
    expect(getContext).toHaveBeenCalledTimes(2)
    expect(getDetail).toHaveBeenCalledTimes(2)
  })

  it('invalidates affected review and restaurant caches after saving', async () => {
    vi.mocked(uploadReviewImages).mockResolvedValue([])
    vi.mocked(updateReview).mockResolvedValue(undefined)
    const queryClient = new QueryClient()
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(QueryClientProvider, { client: queryClient }, children)
    const { result } = renderHook(() => useUpdateReviewMutation(), { wrapper })

    await act(() =>
      result.current.mutateAsync({ ...variables, photoFiles: [] }),
    )

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: myReviewQueryKeys.detail(5),
      refetchType: 'all',
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: myReviewQueryKeys.editContext(5),
      refetchType: 'all',
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: myReviewQueryKeys.lists(),
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: restaurantDetailQueryKeys.detail(9),
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: restaurantPhotoQueryKeys.restaurant(9),
    })
    expect(invalidateQueries).toHaveBeenCalledTimes(5)
  })
})
