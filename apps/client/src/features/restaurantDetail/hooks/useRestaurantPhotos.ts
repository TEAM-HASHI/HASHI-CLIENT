import { useInfiniteQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { getRestaurantPhotoDataSource } from '@/features/restaurantDetail/api/restaurantPhotoSource'
import { restaurantPhotosQueryOptions } from '@/features/restaurantDetail/queries/restaurantPhotoQueryOptions'
import type {
  RestaurantPhotoCounts,
  RestaurantPhotoFilter,
} from '@/features/restaurantDetail/types/restaurantPhoto'

export const useRestaurantPhotos = (restaurantId: number, active: boolean) => {
  const { source, key: sourceKey } = getRestaurantPhotoDataSource()
  const [selection, setSelection] = useState({
    restaurantId,
    filter: 'all' as RestaurantPhotoFilter,
    revision: 0,
    active,
    hasOpened: active,
    counts: undefined as RestaurantPhotoCounts | undefined,
  })
  if (selection.restaurantId !== restaurantId || selection.active !== active) {
    const changedRestaurant = selection.restaurantId !== restaurantId
    setSelection({
      restaurantId,
      filter: changedRestaurant ? 'all' : selection.filter,
      revision:
        selection.revision +
        (changedRestaurant || (active && selection.hasOpened) ? 1 : 0),
      active,
      hasOpened: changedRestaurant ? active : selection.hasOpened || active,
      counts: changedRestaurant ? undefined : selection.counts,
    })
  }
  const filter =
    selection.restaurantId === restaurantId ? selection.filter : 'all'
  const enabled = restaurantId > 0
  const query = useInfiniteQuery({
    ...restaurantPhotosQueryOptions(
      source,
      sourceKey,
      restaurantId,
      filter,
      selection.revision,
    ),
    enabled: enabled && (active || !selection.hasOpened),
  })
  const pageCounts = query.data?.pages[0]?.counts
  if (
    selection.restaurantId === restaurantId &&
    pageCounts !== undefined &&
    pageCounts !== selection.counts
  ) {
    setSelection((previous) => ({ ...previous, counts: pageCounts }))
  }

  return {
    enabled,
    filter,
    counts:
      pageCounts ??
      (selection.restaurantId === restaurantId ? selection.counts : undefined),
    photos: query.data?.pages.flatMap((page) => page.photos) ?? [],
    query,
    selectFilter: (nextFilter: RestaurantPhotoFilter) => {
      if (nextFilter === filter) return
      setSelection((previous) => ({
        ...previous,
        restaurantId,
        filter: nextFilter,
        revision: previous.revision + 1,
      }))
    },
  }
}
