import { queryOptions } from '@tanstack/react-query'

import {
  getMyRestaurantSaved,
  getRestaurantSaveCount,
} from '@/features/restaurantDetail/api/getRestaurantSaveSummary'

import { restaurantSaveQueryKeys } from '@/features/collection/queries/collectionQueryKeys'
export { restaurantSaveQueryKeys } from '@/features/collection/queries/collectionQueryKeys'

export const restaurantSaveCountQueryOptions = (restaurantId: number) =>
  queryOptions({
    queryKey: restaurantSaveQueryKeys.count(restaurantId),
    queryFn: async ({ signal }) => ({
      saveCount: await getRestaurantSaveCount(restaurantId, signal),
    }),
    throwOnError: false,
  })

export const restaurantSavedQueryOptions = (
  restaurantId: number,
  sessionVersion: number,
) =>
  queryOptions({
    queryKey: restaurantSaveQueryKeys.saved(restaurantId, sessionVersion),
    queryFn: ({ signal }) => getMyRestaurantSaved(restaurantId, signal),
    throwOnError: false,
  })
