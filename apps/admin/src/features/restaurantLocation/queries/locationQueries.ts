import { queryOptions } from '@tanstack/react-query'
import { restaurantLocationApi } from '@/features/restaurantLocation/api/restaurantLocationApi'
import type { LocationFilters } from '@/features/restaurantLocation/api/restaurantLocationApi'

export const locationKeys = {
  all: ['admin', 'restaurant-location'] as const,
  lists: ['admin', 'restaurant-location', 'list'] as const,
  list: (filters: LocationFilters) =>
    ['admin', 'restaurant-location', 'list', filters] as const,
  status: (id: number) =>
    ['admin', 'restaurant-location', 'status', id] as const,
}

export const locationListOptions = (filters: LocationFilters) =>
  queryOptions({
    queryKey: locationKeys.list(filters),
    queryFn: ({ signal }) => restaurantLocationApi.list(filters, signal),
    staleTime: 0,
    gcTime: 0,
  })

export const locationStatusOptions = (id: number) =>
  queryOptions({
    queryKey: locationKeys.status(id),
    queryFn: ({ signal }) => restaurantLocationApi.status(id, signal),
    staleTime: 0,
    gcTime: 0,
  })
