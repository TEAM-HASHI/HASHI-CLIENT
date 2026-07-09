import { useQuery } from '@tanstack/react-query'

import { searchRestaurants } from '@/pages/search/api/searchRestaurants'
import type { SearchRestaurantsParams } from '@/pages/search/types'

export const searchRestaurantsQueryKey = (
  params: SearchRestaurantsParams | null,
) => ['searchRestaurants', params] as const

export const useSearchRestaurantsQuery = (
  params: SearchRestaurantsParams | null,
) => {
  return useQuery({
    enabled: params !== null,
    queryFn: () => {
      if (!params) {
        return []
      }

      return searchRestaurants(params)
    },
    queryKey: searchRestaurantsQueryKey(params),
  })
}
