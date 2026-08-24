import { generatePath } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'

export const getRestaurantDetailPath = (restaurantId: string) =>
  generatePath(ROUTES.restaurantDetail, { restaurantId })

export const getRestaurantMenuDetailPath = (
  restaurantId: string,
  menuId: string,
) => generatePath(ROUTES.restaurantMenuDetail, { menuId, restaurantId })

export const getRestaurantReservationNewPath = (restaurantId: string) =>
  generatePath(ROUTES.restaurantReservationNew, { restaurantId })

export const getRestaurantReviewNewPath = (
  restaurantId: string,
  reservationId: string,
) => {
  const pathname = generatePath(ROUTES.reviewNew, { restaurantId })
  const searchParams = new URLSearchParams({ reservationId })

  return `${pathname}?${searchParams.toString()}`
}
