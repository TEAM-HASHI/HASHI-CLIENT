import { type InfiniteData, useInfiniteQuery } from '@tanstack/react-query'

import {
  getMyReviews,
  type MyReviewsData,
} from '@/pages/myReviews/api/myReviewsApi'
import { myReviewQueryKeys } from '@/features/review/queries'

export const MY_REVIEWS_PAGE_SIZE = 20

export const useMyReviewsInfiniteQuery = (enabled: boolean) =>
  useInfiniteQuery<
    MyReviewsData,
    Error,
    InfiniteData<MyReviewsData>,
    ReturnType<typeof myReviewQueryKeys.writtenInfinite>,
    number | undefined
  >({
    enabled,
    queryFn: ({ pageParam }) =>
      getMyReviews({ cursor: pageParam, size: MY_REVIEWS_PAGE_SIZE }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
    queryKey: myReviewQueryKeys.writtenInfinite(MY_REVIEWS_PAGE_SIZE),
    throwOnError: false,
  })
