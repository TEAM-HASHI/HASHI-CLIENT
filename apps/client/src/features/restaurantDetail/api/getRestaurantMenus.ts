import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

type RestaurantMenuListResponse =
  components['schemas']['RestaurantMenuListResponse']
export type RestaurantMenuResponse =
  components['schemas']['RestaurantMenuResponse']

export interface RestaurantMenuListData {
  menus: RestaurantMenuResponse[]
  nextCursor?: number
  hasNext: boolean
}

interface GetRestaurantMenusParams {
  restaurantId: number
  excludeMenuId?: number
  cursor?: number
  size: number
  signal?: AbortSignal
}

const createRestaurantMenusSearchParams = ({
  cursor,
  excludeMenuId,
  size,
}: Pick<GetRestaurantMenusParams, 'cursor' | 'excludeMenuId' | 'size'>) => {
  const params = new URLSearchParams({ size: String(size) })

  if (excludeMenuId !== undefined) {
    params.set('excludeMenuId', String(excludeMenuId))
  }

  if (cursor !== undefined) {
    params.set('cursor', String(cursor))
  }

  return params.toString()
}

export const getRestaurantMenus = async ({
  restaurantId,
  cursor,
  excludeMenuId,
  size,
  signal,
}: GetRestaurantMenusParams): Promise<RestaurantMenuListData> => {
  const searchParams = createRestaurantMenusSearchParams({
    cursor,
    excludeMenuId,
    size,
  })
  const response = await request<RestaurantMenuListResponse>(
    `/api/v1/restaurants/${restaurantId}/menus?${searchParams}`,
    ...(signal ? [{ signal }] : []),
  )

  if (
    !response ||
    !Array.isArray(response.content) ||
    typeof response.hasNext !== 'boolean' ||
    (response.hasNext &&
      (!Number.isSafeInteger(response.nextCursor) ||
        (response.nextCursor ?? 0) <= 0 ||
        response.nextCursor === cursor))
  ) {
    throw new Error('Invalid restaurant menu list response')
  }

  return {
    menus: response.content,
    nextCursor: response.nextCursor,
    hasNext: response.hasNext,
  }
}
