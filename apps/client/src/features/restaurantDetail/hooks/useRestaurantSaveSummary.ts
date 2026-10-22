import { useQuery } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'

import {
  restaurantSaveCountQueryOptions,
  restaurantSavedQueryOptions,
} from '@/features/restaurantDetail/queries/restaurantSaveQueryOptions'
import {
  getAuthSessionVersion,
  subscribeAuthSession,
} from '@/shared/auth/authSession'
import { useAuthStatus } from '@/shared/hooks/useAuthStatus'

export const useRestaurantSaveSummary = (
  restaurantId: number,
): { saveCount: number | undefined; saved: boolean } => {
  const version = useSyncExternalStore(
    subscribeAuthSession,
    getAuthSessionVersion,
    getAuthSessionVersion,
  )
  const { isAuthenticated } = useAuthStatus()
  const isValidId = Number.isSafeInteger(restaurantId) && restaurantId > 0
  const countQuery = useQuery({
    ...restaurantSaveCountQueryOptions(restaurantId),
    enabled: isValidId,
  })
  const savedQuery = useQuery({
    ...restaurantSavedQueryOptions(restaurantId, version),
    enabled: isValidId && isAuthenticated,
  })

  return {
    saveCount: countQuery.data?.saveCount,
    saved: isAuthenticated && (savedQuery.data ?? false),
  }
}
