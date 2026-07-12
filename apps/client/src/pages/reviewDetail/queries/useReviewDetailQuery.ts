import { useQuery } from '@tanstack/react-query'

import { myReviewQueryKeys } from '@/features/review/queries'
import { getMyReviewDetail } from '@/pages/reviewDetail/api/getMyReviewDetail'

export const useReviewDetailQuery = (reviewId: number | null) =>
  useQuery({
    enabled: reviewId !== null,
    queryFn: () => {
      if (reviewId === null) {
        throw new Error('A valid reviewId is required')
      }

      return getMyReviewDetail(reviewId)
    },
    queryKey: myReviewQueryKeys.detail(reviewId),
    throwOnError: false,
  })
