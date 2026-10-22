import type { MapRestaurant } from '@/pages/map/types'
import { useQuery } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'
import {
  getAuthSessionVersion,
  subscribeAuthSession,
} from '@/shared/auth/authSession'
import { useAuthStatus } from '@/shared/hooks/useAuthStatus'
import {
  mapSaveCountsQueryOptions,
  mapSavedQueryOptions,
} from '@/pages/map/queries/mapSaveQueryOptions'

export const useMapRestaurantSaves = (
  restaurants: MapRestaurant[],
): MapRestaurant[] => {
  const ids = [
    ...new Set(
      restaurants
        .map((item) => Number(item.id))
        .filter((id) => Number.isSafeInteger(id) && id > 0),
    ),
  ].sort((a, b) => a - b)
  const version = useSyncExternalStore(
    subscribeAuthSession,
    getAuthSessionVersion,
    getAuthSessionVersion,
  )
  const { isAuthenticated } = useAuthStatus()
  const counts = useQuery({
    ...mapSaveCountsQueryOptions(ids),
    enabled: ids.length > 0,
  })
  const saved = useQuery({
    ...mapSavedQueryOptions(ids, version),
    enabled: ids.length > 0 && isAuthenticated,
  })
  return restaurants.map((item) => ({
    ...item,
    saveCount: counts.data?.[Number(item.id)],
    saved: isAuthenticated && (saved.data?.[Number(item.id)] ?? false),
  }))
}
