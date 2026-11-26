import type { VisitedReservationFilters } from '@/features/review/api/getVisitedReservations'

export const visitedReservationQueryKeys = {
  all: ['reviews', 'visitedReservations'] as const,
  reviewWrite: (restaurantId: number, session: number) =>
    [
      ...visitedReservationQueryKeys.all,
      'reviewWrite',
      restaurantId,
      session,
    ] as const,
  infiniteList: (params: VisitedReservationFilters) =>
    [...visitedReservationQueryKeys.all, 'infiniteList', params] as const,
}
