import { useQuery } from '@tanstack/react-query'

import { getMyReviewDetail } from '@/features/review/api/getMyReviewDetail'
import { myReviewQueryKeys } from '@/features/review/queries/myReviewQueryKeys'

export const useMyReviewDetailQuery = (reviewId: number | null) =>
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
