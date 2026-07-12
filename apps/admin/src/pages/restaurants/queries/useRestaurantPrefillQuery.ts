import { useQuery } from '@tanstack/react-query'
import type { RestaurantCatalogItem } from '@/pages/restaurants/api/restaurantCatalogApi'
import { restaurantCatalogApi } from '@/pages/restaurants/api/restaurantCatalogApi'
import { restaurantQueryKeys } from '@/pages/restaurants/queries/restaurantQueryKeys'
import { toRestaurantPrefillView } from '@/pages/restaurants/restaurantViewModel'

export const useRestaurantPrefillQuery = (
  restaurantId: number | null,
  listItem: RestaurantCatalogItem | null,
) =>
  useQuery({
    enabled: restaurantId != null,
    queryKey: restaurantQueryKeys.prefill(restaurantId ?? 0, listItem),
    queryFn: async () => {
      if (restaurantId == null) {
        throw new Error('식당 ID가 필요합니다.')
      }

      const [summary, storeInformation, menus] = await Promise.all([
        restaurantCatalogApi.getSummary(restaurantId),
        restaurantCatalogApi.getStoreInformation(restaurantId),
        restaurantCatalogApi.listAllMenus(restaurantId),
      ])

      return toRestaurantPrefillView({
        listItem,
        summary,
        storeInformation,
        menus,
      })
    },
  })
