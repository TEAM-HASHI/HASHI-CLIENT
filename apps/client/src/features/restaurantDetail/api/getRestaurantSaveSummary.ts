import { request } from '@/shared/api/request'
import type { components } from '@/shared/api/generated/openapi'

type SaveResponse = components['schemas']['MyRestaurantSavesResponse']

export const getMyRestaurantSaved = async (
  restaurantId: number,
  signal?: AbortSignal,
): Promise<boolean> => {
  if (!Number.isSafeInteger(restaurantId) || restaurantId <= 0) {
    throw new Error('Invalid restaurant id')
  }

  const response = await request<SaveResponse>(
    '/api/v1/users/me/restaurant-saves',
    {
      searchParams: { restaurantIds: String(restaurantId) },
      signal,
    },
  )

  if (
    response === null ||
    !Array.isArray(response.restaurants) ||
    response.restaurants.length > 1
  ) {
    throw new Error('Invalid restaurant save summary response')
  }

  const row = response.restaurants[0]
  if (response.restaurants.length === 0) return false
  if (row === null || row.restaurantId !== restaurantId) {
    throw new Error('Invalid restaurant save summary restaurant id')
  }

  if (!('saved' in row) || typeof row.saved !== 'boolean') {
    throw new Error('Invalid restaurant saved state')
  }
  return row.saved
}
