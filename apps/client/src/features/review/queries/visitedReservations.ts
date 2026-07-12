import {
  type InfiniteData,
  queryOptions,
  useInfiniteQuery,
} from '@tanstack/react-query'

import {
  getVisitedReservations,
  type VisitedReservationFilters,
  type VisitedReservationListData,
  type VisitedReservationParams,
} from '@/features/review/api'

export const visitedReservationQueryKeys = {
  all: ['reviews', 'visitedReservations'] as const,
  infiniteList: (params: VisitedReservationFilters) =>
    [...visitedReservationQueryKeys.all, 'infiniteList', params] as const,
  list: (params: VisitedReservationParams) =>
    [...visitedReservationQueryKeys.all, 'list', params] as const,
}

export const visitedReservationsQueryOptions = (
  params: VisitedReservationParams,
) =>
  queryOptions({
    queryFn: () => getVisitedReservations(params),
    queryKey: visitedReservationQueryKeys.list(params),
    throwOnError: false,
  })

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
