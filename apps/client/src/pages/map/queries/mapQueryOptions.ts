import { queryOptions } from '@tanstack/react-query'

import { getMapRegions } from '@/pages/map/api/getMapRegions'
import { getMapRestaurantLocation } from '@/pages/map/api/getMapRestaurantLocation'
import { getMapRestaurants } from '@/pages/map/api/getMapRestaurants'
import type { MapPageRequest } from '@/pages/map/api/mapApiTypes'
import { mapQueryKeys } from '@/pages/map/queries/mapQueryKeys'
import { isApiError } from '@/shared/api/apiError'
import { checkShouldRetryQuery } from '@/shared/api/errorPolicy'

export const checkShouldRetryMapQuery = (
  failureCount: number,
  error: Error,
) => {
  if (
    isApiError(error) &&
    ['RESTAURANT-014', 'RESTAURANT-017'].includes(error.code)
  )
    return false
  return checkShouldRetryQuery(failureCount, error)
}

export const mapQueryPolicy = {
  retry: checkShouldRetryMapQuery,
  throwOnError: false,
  gcTime: 0,
  staleTime: 0,
  refetchOnWindowFocus: false,
} as const

export const mapRegionsQueryOptions = () =>
  queryOptions({
    ...mapQueryPolicy,
    queryKey: mapQueryKeys.regions(),
    queryFn: ({ signal }) => getMapRegions(signal),
  })

export const mapRestaurantsQueryOptions = (request: MapPageRequest) =>
  queryOptions({
    ...mapQueryPolicy,
    queryKey: mapQueryKeys.list(request),
    queryFn: ({ signal }) => getMapRestaurants(request, signal),
  })

export const mapRestaurantLocationQueryOptions = (id: string) =>
  queryOptions({
    ...mapQueryPolicy,
    queryKey: mapQueryKeys.location(id),
    queryFn: ({ signal }) => getMapRestaurantLocation(id, signal),
  })
