import { queryOptions } from '@tanstack/react-query'
import {
  getMapRestaurantSaveCounts,
  getMyMapRestaurantSaves,
} from '@/pages/map/api/getMapRestaurantSaves'
import { mapQueryPolicy } from '@/pages/map/queries/mapQueryOptions'

import { mapSaveQueryKeys } from '@/pages/map/queries/mapQueryKeys'
export { mapSaveQueryKeys } from '@/pages/map/queries/mapQueryKeys'
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
