import { useMemo } from 'react'

export interface ReservationRestaurant {
  id: string
  name: string
  imageUrl: string | null
  businessHours: {
    open: string
    close: string
  }
  reservationIntervalMinutes: number
}

const DEFAULT_RESTAURANT = {
  id: 'default',
  name: '야키니쿠 리키마루 이케부쿠로 히가시구치 텐',
  imageUrl: null,
  businessHours: {
    open: '11:00',
    close: '20:00',
  },
  reservationIntervalMinutes: 30,
} satisfies ReservationRestaurant

const RESTAURANT_MOCKS: Record<string, ReservationRestaurant> = {
  default: DEFAULT_RESTAURANT,
}

const getReservationRestaurant = (restaurantId?: string) => {
  if (restaurantId && RESTAURANT_MOCKS[restaurantId]) {
    return RESTAURANT_MOCKS[restaurantId]
  }

  if (restaurantId) {
    return {
      ...DEFAULT_RESTAURANT,
      id: restaurantId,
    }
  }

  return DEFAULT_RESTAURANT
}

export const useReservationRestaurant = (restaurantId?: string) => {
  return useMemo(() => getReservationRestaurant(restaurantId), [restaurantId])
}
