import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'

import type {
  RestaurantPhotoFilter,
  RestaurantPhotoSource,
} from '@/features/restaurantDetail/types/restaurantPhoto'

export const restaurantPhotoQueryKeys = {
  restaurant: (restaurantId: number) =>
    ['restaurantPhotos', restaurantId] as const,
  root: (sourceKey: string, restaurantId: number) =>
    [...restaurantPhotoQueryKeys.restaurant(restaurantId), sourceKey] as const,
  counts: (sourceKey: string, restaurantId: number) =>
    [
      ...restaurantPhotoQueryKeys.root(sourceKey, restaurantId),
      'counts',
    ] as const,
  list: (
    sourceKey: string,
    restaurantId: number,
    filter: RestaurantPhotoFilter,
    revision: number,
  ) =>
    [
      ...restaurantPhotoQueryKeys.root(sourceKey, restaurantId),
      'infinite',
      filter,
      revision,
    ] as const,
}

export const restaurantPhotoCountsQueryOptions = (
  { getPage }: RestaurantPhotoSource,
  sourceKey: string,
  restaurantId: number,
) =>
  // sourceKey identifies the adapter; getPage itself is not a serializable key.
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  queryOptions({
    queryKey: restaurantPhotoQueryKeys.counts(sourceKey, restaurantId),
    queryFn: async ({ signal }) =>
      (await getPage({ restaurantId, filter: 'all', signal })).counts,
    retry: 1,
    throwOnError: false,
  })

export const restaurantPhotosQueryOptions = (
  { getPage }: RestaurantPhotoSource,
  sourceKey: string,
  restaurantId: number,
  filter: RestaurantPhotoFilter,
  revision: number,
) =>
  // sourceKey identifies the adapter; getPage itself is not a serializable key.
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  infiniteQueryOptions({
    queryKey: restaurantPhotoQueryKeys.list(
      sourceKey,
      restaurantId,
      filter,
      revision,
    ),
    queryFn: ({ pageParam, signal }) =>
      getPage({ restaurantId, filter, cursor: pageParam, signal }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor,
    retry: 1,
    throwOnError: false,
    gcTime: 0,
  })
