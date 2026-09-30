import { useLocation } from 'react-router-dom'
import { useCallback, useState } from 'react'

import type { ReservationGuestCounts } from '@/features/reservation/constants/guest'
import { checkIsReservationRequestDraft } from '@/features/reservation/reservationDraft'
import { useReservationFormControls } from '@/features/reservation/hooks/useReservationFormControls'
import { createReservationTimeSlots } from '@/features/reservation/utils/createReservationTimeSlots'
import { formatDateToLocalDateString } from '@/shared/utils/date'

export interface AnywhereReservationDraft {
  source: 'anywhere'
  restaurantId: null
  restaurantName: string
  restaurantAddress: string
  restaurantImageUrl: null
  guestName: string
  guests: ReservationGuestCounts
  date: string
  time: string
  requestNote?: string
}

const ANYWHERE_RESERVATION_BUSINESS_HOURS = {
  open: '11:00',
  close: '23:30',
}

const ANYWHERE_RESERVATION_INTERVAL_MINUTES = 30

const ANYWHERE_RESERVATION_TIME_SLOTS = createReservationTimeSlots(
  ANYWHERE_RESERVATION_BUSINESS_HOURS,
  ANYWHERE_RESERVATION_INTERVAL_MINUTES,
)

export const useAnywhereReservationForm = () => {
  const location = useLocation()
  const initialDraft =
    checkIsReservationRequestDraft(location.state) &&
    location.state.source === 'anywhere'
      ? location.state
      : null
  const [restaurantName, setRestaurantName] = useState(
    initialDraft?.restaurantName ?? '',
  )
  const [restaurantAddress, setRestaurantAddress] = useState(
    initialDraft?.restaurantAddress ?? '',
  )
  const checkIsDateReservable = useCallback(() => true, [])
  const getTimeSlots = useCallback(() => ANYWHERE_RESERVATION_TIME_SLOTS, [])
  const formControls = useReservationFormControls({
    checkIsDateReservable,
    getTimeSlots,
    initialDraft,
  })
  const {
    fields: formFields,
    guestCounters,
    calendar,
    timeSelector,
    validity,
    values,
  } = formControls
  const isRestaurantNameValid =
    restaurantName.trim().length > 0 && restaurantName.trim().length <= 200
  const isRestaurantAddressValid =
    restaurantAddress.trim().length > 0 &&
    restaurantAddress.trim().length <= 200
  const canSubmit =
    isRestaurantNameValid &&
    isRestaurantAddressValid &&
    validity.isGuestNameValid &&
    validity.totalGuestCount > 0 &&
    validity.isSelectedDateValid &&
    validity.hasSelectedTime

  const createAnywhereReservationDraft = ():
    | AnywhereReservationDraft
    | undefined => {
    if (
      !canSubmit ||
      values.selectedDate === undefined ||
      !values.selectedTime
    ) {
      return undefined
    }

    return {
      source: 'anywhere',
      restaurantId: null,
      restaurantName: restaurantName.trim(),
      restaurantAddress: restaurantAddress.trim(),
      restaurantImageUrl: null,
      guestName: formFields.guestName.value.trim(),
      guests: values.guestCounts,
      date: formatDateToLocalDateString(values.selectedDate),
      time: values.selectedTime,
      ...(formFields.requestNote.value.trim()
        ? { requestNote: formFields.requestNote.value.trim() }
        : {}),
    }
  }

  return {
    hasChanges: Boolean(
      formControls.hasChanges || restaurantName || restaurantAddress,
    ),
    fields: {
      restaurantName: {
        value: restaurantName,
        onValueChange: setRestaurantName,
      },
      restaurantAddress: {
        value: restaurantAddress,
        onValueChange: setRestaurantAddress,
      },
      ...formFields,
    },
    guestCounters,
    calendar,
    timeSelector,
    submit: {
      canSubmit,
      createAnywhereReservationDraft,
    },
  }
}
