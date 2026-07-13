import { queryOptions } from '@tanstack/react-query'

import { getRestaurantMain } from '@/features/restaurantDetail/api/getRestaurantMain'
import { getRestaurantStoreInformation } from '@/features/restaurantDetail/api/getRestaurantStoreInformation'
import { restaurantDetailQueryKeys } from '@/features/restaurantDetail/queries/restaurantDetailQueryKeys'

export const restaurantMainQueryOptions = (restaurantId: number) =>
  queryOptions({
    queryFn: () => getRestaurantMain(restaurantId),
    queryKey: restaurantDetailQueryKeys.main(restaurantId),
  })

export const restaurantStoreInformationQueryOptions = (restaurantId: number) =>
  queryOptions({
    queryFn: () => getRestaurantStoreInformation(restaurantId),
    queryKey: restaurantDetailQueryKeys.storeInformation(restaurantId),
  })
