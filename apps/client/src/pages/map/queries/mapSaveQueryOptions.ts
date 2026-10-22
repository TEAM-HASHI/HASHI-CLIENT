import { queryOptions } from '@tanstack/react-query'
import {
  getMapRestaurantSaveCounts,
  getMyMapRestaurantSaves,
} from '@/pages/map/api/getMapRestaurantSaves'
import { mapQueryPolicy } from '@/pages/map/queries/mapQueryOptions'

export const mapSaveQueryKeys = {
  counts: (ids: number[]) => ['map', 'saveCounts', ids] as const,
  saved: (ids: number[], sessionVersion: number) =>
    ['map', 'saved', sessionVersion, ids] as const,
}
export const mapSaveCountsQueryOptions = (ids: number[]) =>
  queryOptions({
    ...mapQueryPolicy,
    queryKey: mapSaveQueryKeys.counts(ids),
    queryFn: ({ signal }) => getMapRestaurantSaveCounts(ids, signal),
  })
export const mapSavedQueryOptions = (ids: number[], sessionVersion: number) =>
  queryOptions({
    ...mapQueryPolicy,
    queryKey: mapSaveQueryKeys.saved(ids, sessionVersion),
    queryFn: ({ signal }) => getMyMapRestaurantSaves(ids, signal),
  })
