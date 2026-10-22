import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

type SavedRestaurantCountResponse =
  components['schemas']['MySavedRestaurantCountResponse']

export const getMySavedRestaurantCount = async (
  signal?: AbortSignal,
): Promise<number> => {
  const response = await request<SavedRestaurantCountResponse>(
    '/api/v1/users/me/saved-restaurants/count',
    { signal, cache: 'no-store' },
  )
  const count = response?.savedRestaurantCount

  if (typeof count !== 'number' || !Number.isSafeInteger(count) || count < 0) {
    throw new Error(
      'Invalid savedRestaurantCount: GET /api/v1/users/me/saved-restaurants/count',
    )
  }

  return count
}
