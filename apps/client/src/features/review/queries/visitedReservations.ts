import { type InfiniteData, useInfiniteQuery } from '@tanstack/react-query'

import {
  getVisitedReservations,
  type VisitedReservationFilters,
  type VisitedReservationListData,
} from '@/features/review/api/getVisitedReservations'
import { visitedReservationQueryKeys } from '@/features/review/queries/visitedReservationQueryKeys'

export const useVisitedReservationsInfiniteQuery = (
  params: VisitedReservationFilters,
  enabled: boolean,
) =>
  useInfiniteQuery<
    VisitedReservationListData,
    Error,
    InfiniteData<VisitedReservationListData>,
    ReturnType<typeof visitedReservationQueryKeys.infiniteList>,
    number | undefined
  >({
    enabled,
    queryFn: ({ pageParam }) =>
      getVisitedReservations({ ...params, cursor: pageParam }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
    queryKey: visitedReservationQueryKeys.infiniteList(params),
    throwOnError: false,
  })
