import { useMemo } from 'react'
import { useSuspenseQueries } from '@tanstack/react-query'

import {
  restaurantMainQueryOptions,
  restaurantStoreInformationQueryOptions,
} from '@/features/restaurantDetail'

const RESERVATION_INTERVAL_MINUTES = 30

export interface ReservationRestaurantBusinessHour {
  dayOfWeek: string
  open: string | null
  close: string | null
  breakStart: string | null
  breakEnd: string | null
  closed: boolean
}

export interface ReservationRestaurant {
  id: string
  name: string
  address: string
  imageUrl: string | null
  reservationFee: number
  businessHours: ReservationRestaurantBusinessHour[]
  reservationIntervalMinutes: number
}

const parseRestaurantId = (restaurantId?: string) => {
  const parsedRestaurantId = Number(restaurantId)

  if (!Number.isSafeInteger(parsedRestaurantId) || parsedRestaurantId <= 0) {
    throw new Error('유효하지 않은 식당 ID입니다.')
  }

  return parsedRestaurantId
}

export const useReservationRestaurant = (restaurantId?: string) => {
  const parsedRestaurantId = parseRestaurantId(restaurantId)
  const [mainQuery, storeInformationQuery] = useSuspenseQueries({
    queries: [
      restaurantMainQueryOptions(parsedRestaurantId),
      restaurantStoreInformationQueryOptions(parsedRestaurantId),
    ],
  })

  return useMemo<ReservationRestaurant>(
    () => ({
      id: String(mainQuery.data.restaurantId),
      name: mainQuery.data.name,
      address: mainQuery.data.address,
      imageUrl:
        mainQuery.data.thumbnailUrl ?? mainQuery.data.imageUrls[0] ?? null,
      reservationFee: mainQuery.data.reservationFee,
      businessHours: storeInformationQuery.data.businessHours.map(
        ({ dayOfWeek, openTime, closeTime, breakStart, breakEnd, closed }) => ({
          dayOfWeek: dayOfWeek ?? '',
          open: openTime ?? null,
          close: closeTime ?? null,
          breakStart: breakStart ?? null,
          breakEnd: breakEnd ?? null,
          closed: closed ?? false,
        }),
      ),
      reservationIntervalMinutes: RESERVATION_INTERVAL_MINUTES,
    }),
    [mainQuery.data, storeInformationQuery.data.businessHours],
  )
}
