import { queryOptions } from '@tanstack/react-query'
import {
  getRestaurantSaveCounts,
  getMyRestaurantSaves,
} from '@/features/collection/api/getRestaurantSaves'
import { mapQueryPolicy } from '@/pages/map/queries/mapQueryOptions'

import { mapSaveQueryKeys } from '@/features/collection/queries/collectionQueryKeys'
export { mapSaveQueryKeys } from '@/features/collection/queries/collectionQueryKeys'
export const mapSaveCountsQueryOptions = (ids: number[]) =>
  queryOptions({
    ...mapQueryPolicy,
    queryKey: mapSaveQueryKeys.counts(ids),
    queryFn: ({ signal }) => getRestaurantSaveCounts(ids, signal),
  })
export const mapSavedQueryOptions = (ids: number[], sessionVersion: number) =>
  queryOptions({
    ...mapQueryPolicy,
    queryKey: mapSaveQueryKeys.saved(ids, sessionVersion),
    queryFn: ({ signal }) => getMyRestaurantSaves(ids, signal),
  })
