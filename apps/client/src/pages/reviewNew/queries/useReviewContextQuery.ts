import { useQuery } from '@tanstack/react-query'

import { getReviewContext } from '@/pages/reviewNew/api/getReviewContext'
import { reviewNewQueryKeys } from '@/pages/reviewNew/queries/reviewNewQueryKeys'

export const useReviewContextQuery = (reservationId: number | null) => {
  return useQuery({
    queryKey:
      reservationId === null
        ? reviewNewQueryKeys.contexts()
        : reviewNewQueryKeys.context(reservationId),
    queryFn: () => {
      if (reservationId === null) {
        throw new Error('reservationId가 필요합니다.')
      }

      return getReviewContext(reservationId)
    },
    enabled: reservationId !== null,
    throwOnError: false,
  })
}
