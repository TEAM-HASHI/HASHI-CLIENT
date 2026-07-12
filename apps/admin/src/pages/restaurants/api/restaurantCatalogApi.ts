import { ADMIN_ENDPOINTS } from '@/shared/api/adminEndpoints'
import type { components, paths } from '@/shared/api/generated/user-openapi'
import { request } from '@/shared/api/request'

export type RestaurantCatalogParams = NonNullable<
  paths['/api/v1/restaurants']['get']['parameters']['query']
>
export type RestaurantCatalogData =
  components['schemas']['RestaurantListResponse']
export type RestaurantCatalogItem =
  components['schemas']['RestaurantSummaryResponse']
export type RestaurantSummaryData =
  components['schemas']['RestaurantMainResponse']
export type RestaurantStoreInformationData =
  components['schemas']['RestaurantStoreInformationResponse']
export type RestaurantMenuData = components['schemas']['RestaurantMenuResponse']
type RestaurantMenuListData =
  components['schemas']['RestaurantMenuListResponse']

const toSearchParams = (params: Record<string, unknown>) => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  return searchParams
}

export const restaurantCatalogApi = {
  list(params: RestaurantCatalogParams = {}) {
    return request<RestaurantCatalogData>(ADMIN_ENDPOINTS.publicRestaurants, {
      method: 'get',
      searchParams: toSearchParams(params),
    })
  },
  getSummary(restaurantId: number) {
    return request<RestaurantSummaryData>(
      ADMIN_ENDPOINTS.publicRestaurantSummary(restaurantId),
      { method: 'get' },
    )
  },
  getStoreInformation(restaurantId: number) {
    return request<RestaurantStoreInformationData>(
      ADMIN_ENDPOINTS.publicRestaurantStoreInformation(restaurantId),
      { method: 'get' },
    )
  },
  async listAllMenus(restaurantId: number): Promise<RestaurantMenuData[]> {
    const menus: RestaurantMenuData[] = []
    let cursor: number | undefined
    let hasNext = true

    while (hasNext) {
      const page = await request<RestaurantMenuListData>(
        ADMIN_ENDPOINTS.publicRestaurantMenus(restaurantId),
        {
          method: 'get',
          searchParams: toSearchParams({ cursor, size: 50 }),
        },
      )

      menus.push(...(page.content ?? []))
      hasNext = page.hasNext ?? false

      if (!hasNext) {
        break
      }
      if (page.nextCursor === undefined) {
        throw new Error('메뉴 페이지 응답에 다음 커서가 없습니다.')
      }
      cursor = page.nextCursor
    }

    return menus
  },
}
