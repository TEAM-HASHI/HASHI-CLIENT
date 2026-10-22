import { useQuery } from '@tanstack/react-query'

import { myReviewQueryKeys } from '@/features/review/queries/myReviewQueryKeys'
import { getReviewEditContext } from '@/pages/reviewEdit/api/getReviewEditContext'

export const useReviewEditContextQuery = (reviewId: number | null) =>
  useQuery({
    enabled: reviewId !== null,
    queryFn: () => {
      if (reviewId === null) {
        throw new Error('A valid reviewId is required')
      }

      return getReviewEditContext(reviewId)
    },
    queryKey: myReviewQueryKeys.editContext(reviewId),
    throwOnError: false,
  })
