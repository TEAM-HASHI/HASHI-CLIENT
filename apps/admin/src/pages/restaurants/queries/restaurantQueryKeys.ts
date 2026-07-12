import type {
  RestaurantCatalogItem,
  RestaurantCatalogParams,
} from '@/pages/restaurants/api/restaurantCatalogApi'

const all = ['admin', 'restaurant-catalog'] as const

export const restaurantQueryKeys = {
  all,
  lists: () => [...all, 'list'] as const,
  list: (params: RestaurantCatalogParams) => [...all, 'list', params] as const,
  prefills: () => [...all, 'prefill'] as const,
  prefill: (restaurantId: number, listItem: RestaurantCatalogItem | null) =>
    [...all, 'prefill', restaurantId, listItem] as const,
}
