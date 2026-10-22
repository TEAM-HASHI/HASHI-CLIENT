import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'
import { readMapObject } from '@/pages/map/api/mapApiAdapters'

type SaveResponse =
  | components['schemas']['RestaurantSaveCountsResponse']
  | components['schemas']['MyRestaurantSavesResponse']

const getBatches = async <T extends number | boolean>(
  path: string,
  ids: number[],
  field: 'saveCount' | 'saved',
  signal?: AbortSignal,
): Promise<Record<number, T>> => {
  if (ids.some((id) => !Number.isSafeInteger(id) || id <= 0))
    throw new Error('Invalid restaurant id')
  const unique = [...new Set(ids)].sort((a, b) => a - b)
  const result: Record<number, T> = {}
  for (let offset = 0; offset < unique.length; offset += 100) {
    const batch = unique.slice(offset, offset + 100)
    const response = await request<SaveResponse>(path, {
      searchParams: { restaurantIds: batch.join(',') },
      cache: 'no-store',
      signal,
    })
    const rows = readMapObject(response, 'save response').restaurants
    if (!Array.isArray(rows)) throw new Error('Invalid save rows')
    for (const value of rows) {
      const row = readMapObject(value, 'save row')
      const id = row.restaurantId
      const validValue =
        field === 'saved'
          ? typeof row[field] === 'boolean'
          : typeof row[field] === 'number' &&
            Number.isSafeInteger(row[field]) &&
            row[field] >= 0
      if (
        typeof id !== 'number' ||
        !batch.includes(id) ||
        id in result ||
        !validValue
      )
        throw new Error('Invalid restaurant save row')
      result[id] = row[field] as T
    }
  }
  return result
}

export const getMapRestaurantSaveCounts = (
  ids: number[],
  signal?: AbortSignal,
) =>
  getBatches<number>(
    '/api/v1/restaurants/save-counts',
    ids,
    'saveCount',
    signal,
  )
export const getMyMapRestaurantSaves = (ids: number[], signal?: AbortSignal) =>
  getBatches<boolean>('/api/v1/users/me/restaurant-saves', ids, 'saved', signal)
