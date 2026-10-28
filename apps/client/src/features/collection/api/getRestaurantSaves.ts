import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

type SaveResponse =
  | components['schemas']['RestaurantSaveCountsResponse']
  | components['schemas']['MyRestaurantSavesResponse']

type SaveValues = { saveCount: number; saved: boolean }

const readSaveObject = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid restaurant save response object')
  return value as Record<string, unknown>
}

const getBatches = async <Field extends keyof SaveValues>(
  path: string,
  ids: number[],
  field: Field,
  signal?: AbortSignal,
): Promise<Record<number, SaveValues[Field]>> => {
  if (ids.some((id) => !Number.isSafeInteger(id) || id <= 0))
    throw new Error('Invalid restaurant id')
  const unique = [...new Set(ids)].sort((a, b) => a - b)
  const result: Record<number, SaveValues[Field]> = {}
  for (let offset = 0; offset < unique.length; offset += 100) {
    const batch = unique.slice(offset, offset + 100)
    const response = await request<SaveResponse>(path, {
      searchParams: { restaurantIds: batch.join(',') },
      cache: 'no-store',
      signal,
    })
    const rows = readSaveObject(response).restaurants
    if (!Array.isArray(rows)) throw new Error('Invalid save rows')
    for (const value of rows) {
      const row = readSaveObject(value)
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
      result[id] = row[field] as SaveValues[Field]
    }
  }
  return result
}

export const getRestaurantSaveCounts = (ids: number[], signal?: AbortSignal) =>
  getBatches('/api/v1/restaurants/save-counts', ids, 'saveCount', signal)

export const getMyRestaurantSaves = (ids: number[], signal?: AbortSignal) =>
  getBatches('/api/v1/users/me/restaurant-saves', ids, 'saved', signal)
