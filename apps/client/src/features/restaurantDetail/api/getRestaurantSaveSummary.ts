import { request } from '@/shared/api/request'
import type { components } from '@/shared/api/generated/openapi'

type SaveResponse =
  | components['schemas']['RestaurantSaveCountsResponse']
  | components['schemas']['MyRestaurantSavesResponse']

const getRestaurantSaveRow = async (
  path: string,
  restaurantId: number,
  signal?: AbortSignal,
) => {
  if (!Number.isSafeInteger(restaurantId) || restaurantId <= 0) {
    throw new Error('Invalid restaurant id')
  }

  const response = await request<SaveResponse>(path, {
    searchParams: { restaurantIds: String(restaurantId) },
    signal,
  })

  if (
    response === null ||
    !Array.isArray(response.restaurants) ||
    response.restaurants.length > 1
  ) {
    throw new Error('Invalid restaurant save summary response')
  }

  const row = response.restaurants[0]
  if (response.restaurants.length === 0) return undefined
  if (row === null || row.restaurantId !== restaurantId) {
    throw new Error('Invalid restaurant save summary restaurant id')
  }

  return row
}

export const getRestaurantSaveCount = async (
  restaurantId: number,
  signal?: AbortSignal,
): Promise<number | undefined> => {
  const row = await getRestaurantSaveRow(
    '/api/v1/restaurants/save-counts',
    restaurantId,
    signal,
  )
  if (row === undefined) return undefined
  if (
    !('saveCount' in row) ||
    typeof row.saveCount !== 'number' ||
    !Number.isSafeInteger(row.saveCount) ||
    row.saveCount < 0
  ) {
    throw new Error('Invalid restaurant save count')
  }
  return row.saveCount
}

export const getMyRestaurantSaved = async (
  restaurantId: number,
  signal?: AbortSignal,
): Promise<boolean> => {
  const row = await getRestaurantSaveRow(
    '/api/v1/users/me/restaurant-saves',
    restaurantId,
    signal,
  )
  if (row === undefined) return false
  if (!('saved' in row) || typeof row.saved !== 'boolean') {
    throw new Error('Invalid restaurant saved state')
  }
  return row.saved
}
