import { queryOptions, useQuery } from '@tanstack/react-query'

import { getHotSnsRestaurants } from '@/pages/home/api/getHotSnsRestaurants'
import { homeQueryKeys } from '@/pages/home/queries/homeQueryKeys'

export const hotSnsRestaurantsQueryOptions = () =>
  queryOptions({
    queryFn: getHotSnsRestaurants,
    queryKey: homeQueryKeys.hotSnsRestaurants(),
  })

export const useHotSnsRestaurantsQuery = () => {
  return useQuery({
    ...hotSnsRestaurantsQueryOptions(),
    throwOnError: false,
  })
}
