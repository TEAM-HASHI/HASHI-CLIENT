import { useQuery } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'

import { restaurantSavedQueryOptions } from '@/features/restaurantDetail/queries/restaurantSaveQueryOptions'
import {
  getAuthSessionVersion,
  subscribeAuthSession,
} from '@/shared/auth/authSession'
import { useAuthStatus } from '@/shared/hooks/useAuthStatus'

export const useRestaurantSaveSummary = (
  restaurantId: number,
  count?: number,
): { saveCount: number | undefined; saved: boolean } => {
  const version = useSyncExternalStore(
    subscribeAuthSession,
    getAuthSessionVersion,
    getAuthSessionVersion,
  )
  const { isAuthenticated } = useAuthStatus()
  const isValidId = Number.isSafeInteger(restaurantId) && restaurantId > 0
  const savedQuery = useQuery({
    ...restaurantSavedQueryOptions(restaurantId, version),
    enabled: isValidId && isAuthenticated,
  })

  return {
    saveCount:
      typeof count === 'number' && Number.isSafeInteger(count) && count >= 0
        ? count
        : undefined,
    saved: isAuthenticated && (savedQuery.data ?? false),
  }
}
