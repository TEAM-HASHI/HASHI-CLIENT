import { queryOptions } from '@tanstack/react-query'

import {
  getRestaurants,
  type GetRestaurantsParams,
  type RestaurantSummaryResponse,
} from '@/features/restaurantList/api/getRestaurants'
import type { Restaurant } from '@/features/restaurantList/types'
import { mapRestaurantSummaryToRestaurant } from '@/features/restaurantList/utils'

export const RESERVATION_RESCUE_RESTAURANT_PARAMS = {
  genre: 'all',
  size: 5,
  sort: 'rating',
  type: 'hashi-pick',
} satisfies GetRestaurantsParams

export const reservationRescueQueryKeys = {
  all: ['reservationRescue'] as const,
  restaurants: () =>
    [...reservationRescueQueryKeys.all, 'restaurants'] as const,
}

export const fetchReservationRescueRestaurants = () =>
  getRestaurants(RESERVATION_RESCUE_RESTAURANT_PARAMS)

export const reservationRescueQueryOptions = () =>
  queryOptions({
    queryFn: fetchReservationRescueRestaurants,
    queryKey: reservationRescueQueryKeys.restaurants(),
  })

export const createReservationRescueRestaurants = (
  restaurants: RestaurantSummaryResponse[],
  excludedRestaurantId: number,
): Restaurant[] => {
  return restaurants
    .flatMap((restaurant) => {
      if (restaurant.restaurantId === excludedRestaurantId) {
        return []
      }

      const mappedRestaurant = mapRestaurantSummaryToRestaurant(restaurant)

      return mappedRestaurant ? [mappedRestaurant] : []
    })
    .slice(0, 3)
}
