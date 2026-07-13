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
  cursor?: number
  size: number
}

const createRestaurantMenusSearchParams = ({
  cursor,
  size,
}: Pick<GetRestaurantMenusParams, 'cursor' | 'size'>) => {
  const params = new URLSearchParams({ size: String(size) })

  if (cursor !== undefined) {
    params.set('cursor', String(cursor))
  }

  return params.toString()
}

export const getRestaurantMenus = async ({
  restaurantId,
  cursor,
  size,
}: GetRestaurantMenusParams): Promise<RestaurantMenuListData> => {
  const searchParams = createRestaurantMenusSearchParams({ cursor, size })
  const response = await request<RestaurantMenuListResponse>(
    `/api/v1/restaurants/${restaurantId}/menus?${searchParams}`,
  )

  return {
    menus: response?.content ?? [],
    nextCursor: response?.nextCursor,
    hasNext: response?.hasNext === true,
  }
}
