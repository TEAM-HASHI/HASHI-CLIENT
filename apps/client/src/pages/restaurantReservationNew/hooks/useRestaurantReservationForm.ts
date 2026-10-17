import { useLocation } from 'react-router-dom'
import { useCallback } from 'react'

import type { ReservationGuestCounts } from '@/features/reservation/constants/guest'
import { checkIsReservationRequestDraft } from '@/features/reservation/reservationDraft'
import { useReservationFormControls } from '@/features/reservation/hooks/useReservationFormControls'
import { createReservationTimeSlots } from '@/features/reservation/utils/createReservationTimeSlots'
import type { ReservationRestaurant } from '@/pages/restaurantReservationNew/hooks/useReservationRestaurant'
import { formatDateToLocalDateString } from '@/shared/utils/date'

interface UseRestaurantReservationFormParams {
  restaurant: ReservationRestaurant
}

export interface ReservationDraft {
  restaurantId: string
  restaurantName: string
  restaurantAddress: string
  restaurantImageUrl: string | null
  reservationFee: number
  guestName: string
  guests: ReservationGuestCounts
  date: string
  time: string
  requestNote?: string
}

const DAY_OF_WEEK_NAMES = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const

const getBusinessHoursForDate = (
  date: Date,
  businessHours: ReservationRestaurant['businessHours'],
) => {
  const dayOfWeek = DAY_OF_WEEK_NAMES[date.getDay()]

  return businessHours.find(
    (hours) => hours.dayOfWeek.trim().toUpperCase() === dayOfWeek,
  )
}

const checkIsReservableBusinessHours = (
  businessHours: ReservationRestaurant['businessHours'][number] | undefined,
) => {
  return Boolean(
    businessHours &&
    !businessHours.closed &&
    businessHours.open &&
    businessHours.close,
  )
}

export const useRestaurantReservationForm = ({
  restaurant,
}: UseRestaurantReservationFormParams) => {
  const location = useLocation()
  const initialDraft =
    checkIsReservationRequestDraft(location.state) &&
    location.state.source !== 'anywhere' &&
    location.state.restaurantId === restaurant.id
      ? location.state
      : null
  const getTimeSlots = useCallback(
    (selectedDate: Date | undefined) => {
      const businessHours = selectedDate
        ? getBusinessHoursForDate(selectedDate, restaurant.businessHours)
        : restaurant.businessHours.find(checkIsReservableBusinessHours)

      if (
        !checkIsReservableBusinessHours(businessHours) ||
        !businessHours?.open ||
        !businessHours.close
      ) {
        return []
      }

      return createReservationTimeSlots(
        {
          open: businessHours.open,
          close: businessHours.close,
          breakStart: businessHours.breakStart,
          breakEnd: businessHours.breakEnd,
        },
        restaurant.reservationIntervalMinutes,
        60,
      )
    },
    [restaurant.businessHours, restaurant.reservationIntervalMinutes],
  )

  const checkIsDateReservable = useCallback(
    (date: Date) => getTimeSlots(date).length > 0,
    [getTimeSlots],
  )

  const formControls = useReservationFormControls({
    checkIsDateReservable,
    getTimeSlots,
    initialDraft,
  })
  const { fields, guestCounters, calendar, timeSelector, validity, values } =
    formControls
  const canSubmit =
    validity.isGuestNameValid &&
    validity.totalGuestCount > 0 &&
    validity.isSelectedDateValid &&
    validity.hasSelectedTime

  const createReservationDraft = (): ReservationDraft | undefined => {
    if (
      !canSubmit ||
      values.selectedDate === undefined ||
      !values.selectedTime
    ) {
      return undefined
    }

    return {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantAddress: restaurant.address,
      restaurantImageUrl: restaurant.imageUrl,
      reservationFee: restaurant.reservationFee,
      guestName: fields.guestName.value.trim(),
      guests: values.guestCounts,
      date: formatDateToLocalDateString(values.selectedDate),
      time: values.selectedTime,
      ...(fields.requestNote.value.trim()
        ? { requestNote: fields.requestNote.value.trim() }
        : {}),
    }
  }

  return {
    hasChanges: formControls.hasChanges,
    fields,
    guestCounters,
    calendar,
    timeSelector,
    submit: {
      canSubmit,
      createReservationDraft,
    },
  }
}
