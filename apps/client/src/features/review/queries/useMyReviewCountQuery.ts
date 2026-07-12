import { queryOptions, useQuery } from '@tanstack/react-query'

import { getMyReviewCount } from '@/features/review/api'
import { myReviewQueryKeys } from '@/features/review/queries/myReviewQueryKeys'

export const myReviewCountQueryOptions = () =>
  queryOptions({
    queryFn: getMyReviewCount,
    queryKey: myReviewQueryKeys.count(),
    throwOnError: false,
  })

export const useMyReviewCountQuery = () => useQuery(myReviewCountQueryOptions())
