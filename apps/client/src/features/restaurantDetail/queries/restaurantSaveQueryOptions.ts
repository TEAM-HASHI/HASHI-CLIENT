import { queryOptions } from '@tanstack/react-query'

import { getMyRestaurantSaved } from '@/features/restaurantDetail/api/getRestaurantSaveSummary'

export const restaurantSaveQueryKeys = {
  saved: (restaurantId: number, sessionVersion: number) =>
    ['restaurantSaveSummary', 'saved', restaurantId, sessionVersion] as const,
}

export const restaurantSavedQueryOptions = (
  restaurantId: number,
  sessionVersion: number,
) =>
  queryOptions({
    queryKey: restaurantSaveQueryKeys.saved(restaurantId, sessionVersion),
    queryFn: ({ signal }) => getMyRestaurantSaved(restaurantId, signal),
    throwOnError: false,
  })
