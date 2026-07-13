import type {
  VisitedReservationFilters,
  VisitedReservationParams,
} from '@/features/review/api/getVisitedReservations'

export const visitedReservationQueryKeys = {
  all: ['reviews', 'visitedReservations'] as const,
  infiniteList: (params: VisitedReservationFilters) =>
    [...visitedReservationQueryKeys.all, 'infiniteList', params] as const,
  list: (params: VisitedReservationParams) =>
    [...visitedReservationQueryKeys.all, 'list', params] as const,
}
