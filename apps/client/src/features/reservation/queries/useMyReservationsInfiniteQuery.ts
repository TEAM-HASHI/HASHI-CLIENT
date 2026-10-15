import {
  infiniteQueryOptions,
  type InfiniteData,
  useInfiniteQuery,
} from '@tanstack/react-query'

import {
  getMyReservations,
  type MyReservationsApiStatus,
  type ReservationListResponse,
} from '@/features/reservation/api/getMyReservations'
import { myReservationsQueryKeys } from '@/features/reservation/queries/myReservationsQueryKeys'

const MY_RESERVATIONS_PAGE_SIZE = 10

type UseMyReservationsInfiniteQueryParams = {
  status: MyReservationsApiStatus | null
  initialData?: InfiniteData<ReservationListResponse, number | null>
}

export const myReservationsInfiniteQueryOptions = (
  status: MyReservationsApiStatus,
) =>
  infiniteQueryOptions({
    queryKey: myReservationsQueryKeys.infiniteList(status),
    queryFn: ({ pageParam }) =>
      getMyReservations({
        cursor: pageParam,
        size: MY_RESERVATIONS_PAGE_SIZE,
        status,
      }),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    staleTime: 0,
    throwOnError: false,
  })

export const useMyReservationsInfiniteQuery = ({
  status,
  initialData,
}: UseMyReservationsInfiniteQueryParams) => {
  return useInfiniteQuery<
    ReservationListResponse,
    Error,
    InfiniteData<ReservationListResponse, number | null>,
    | ReturnType<typeof myReservationsQueryKeys.disabled>
    | ReturnType<typeof myReservationsQueryKeys.infiniteList>,
    number | null
  >({
    queryKey:
      status === null
        ? myReservationsQueryKeys.disabled()
        : myReservationsQueryKeys.infiniteList(status),
    queryFn: ({ pageParam }) => {
      if (status === null) {
        throw new Error('내 예약 조회 상태가 null일 수 없습니다.')
      }

      return getMyReservations({
        cursor: pageParam,
        size: MY_RESERVATIONS_PAGE_SIZE,
        status,
      })
    },
    enabled: status !== null,
    initialData,
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    staleTime: 0,
    throwOnError: false,
  })
}
