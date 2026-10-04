import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { getRestaurantPhotoDataSource } from '@/features/restaurantDetail/api/restaurantPhotoSource'
import {
  restaurantPhotoCountsQueryOptions,
  restaurantPhotosQueryOptions,
} from '@/features/restaurantDetail/queries/restaurantPhotoQueryOptions'
import type {
  RestaurantPhotoFilter,
  RestaurantPhotoSource,
} from '@/features/restaurantDetail/types/restaurantPhoto'

const unavailableSource: RestaurantPhotoSource = {
  getPage: async () => {
    throw new Error('Restaurant photo data source is not configured')
  },
}

export const useRestaurantPhotos = (restaurantId: number, active: boolean) => {
  const dataSource = getRestaurantPhotoDataSource()
  const source = dataSource?.source ?? unavailableSource
  const sourceKey = dataSource?.key ?? 'unavailable'
  const [selection, setSelection] = useState({
    restaurantId,
    filter: 'all' as RestaurantPhotoFilter,
    revision: 0,
  })
  if (selection.restaurantId !== restaurantId) {
    setSelection({
      restaurantId,
      filter: 'all',
      revision: selection.revision + 1,
    })
  }
  const filter =
    selection.restaurantId === restaurantId ? selection.filter : 'all'
  const enabled = dataSource !== null && restaurantId > 0
  const countsQuery = useQuery({
    ...restaurantPhotoCountsQueryOptions(source, sourceKey, restaurantId),
    enabled,
  })
  const query = useInfiniteQuery({
    ...restaurantPhotosQueryOptions(
      source,
      sourceKey,
      restaurantId,
      filter,
      selection.revision,
    ),
    enabled: enabled && active,
  })

  return {
    enabled,
    filter,
    counts: query.data?.pages[0]?.counts ?? countsQuery.data,
    photos: query.data?.pages.flatMap((page) => page.photos) ?? [],
    query,
    selectFilter: (nextFilter: RestaurantPhotoFilter) => {
      if (nextFilter === filter) return
      setSelection((previous) => ({
        restaurantId,
        filter: nextFilter,
        revision: previous.revision + 1,
      }))
    },
  }
}
