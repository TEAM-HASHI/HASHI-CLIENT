import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'

import {
  restaurantPhotosQueryOptions,
  restaurantPhotoQueryKeys,
} from '@/features/restaurantDetail/queries/restaurantPhotoQueryOptions'
import type { RestaurantPhotoSource } from '@/features/restaurantDetail/types/restaurantPhoto'
import { HttpStatusError } from '@/shared/api/apiError'

describe('restaurant photo queries', () => {
  it('invalidates all photo lists and counts for only the reviewed restaurant', async () => {
    const client = new QueryClient()
    const counts = restaurantPhotoQueryKeys.list('preview', 10, 'all', 0)
    const list = restaurantPhotoQueryKeys.list('preview', 10, 'review', 0)
    const other = restaurantPhotoQueryKeys.list('preview', 20, 'all', 0)
    for (const key of [counts, list, other]) client.setQueryData(key, {})
    await client.invalidateQueries({
      queryKey: restaurantPhotoQueryKeys.restaurant(10),
    })
    expect(client.getQueryState(counts)?.isInvalidated).toBe(true)
    expect(client.getQueryState(list)?.isInvalidated).toBe(true)
    expect(client.getQueryState(other)?.isInvalidated).toBe(false)
    client.clear()
  })
  it('retries a failed page once without routing to an error boundary', async () => {
    const getPage = vi.fn().mockRejectedValue(new HttpStatusError(503))
    const client = new QueryClient({
      defaultOptions: { queries: { retryDelay: 0 } },
    })
    const options = restaurantPhotosQueryOptions(
      { getPage },
      'test',
      10,
      'all',
      0,
    )
    await expect(client.fetchInfiniteQuery(options)).rejects.toThrow()
    expect(getPage).toHaveBeenCalledTimes(2)
    expect(options.throwOnError).toBe(false)
    client.clear()
  })

  it('does not automatically retry an invalid cursor or a missing restaurant', async () => {
    for (const status of [400, 404]) {
      const getPage = vi.fn().mockRejectedValue(new HttpStatusError(status))
      const client = new QueryClient({
        defaultOptions: { queries: { retryDelay: 0 } },
      })
      await expect(
        client.fetchInfiniteQuery(
          restaurantPhotosQueryOptions({ getPage }, 'api', 10, 'all', 0),
        ),
      ).rejects.toThrow()
      expect(getPage).toHaveBeenCalledTimes(1)
      client.clear()
    }
  })

  it('keeps source, restaurant, filter and reset revision caches separate', () => {
    const source: RestaurantPhotoSource = { getPage: vi.fn() }
    const base = restaurantPhotosQueryOptions(
      source,
      'preview',
      10,
      'all',
      0,
    ).queryKey
    expect(
      restaurantPhotosQueryOptions(source, 'api', 10, 'all', 0).queryKey,
    ).not.toEqual(base)
    expect(
      restaurantPhotosQueryOptions(source, 'preview', 20, 'all', 0).queryKey,
    ).not.toEqual(base)
    expect(
      restaurantPhotosQueryOptions(source, 'preview', 10, 'menu', 0).queryKey,
    ).not.toEqual(base)
    expect(
      restaurantPhotosQueryOptions(source, 'preview', 10, 'all', 1).queryKey,
    ).not.toEqual(base)
  })
})
