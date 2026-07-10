import { useState } from 'react'

import {
  INITIAL_RESERVATION_GUEST_COUNTS,
  RESERVATION_GUEST_COUNTERS,
} from '@/features/reservation/constants/guest'
import type {
  ReservationGuestCounts,
  ReservationGuestType,
} from '@/features/reservation/constants/guest'
import { createReservationTimeSlots } from '@/features/reservation/utils/createReservationTimeSlots'
import {
  checkIsTodayOrBefore,
  createMonthStart,
  formatDateToLocalDateString,
} from '@/shared/utils/date'

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
  requestNote: string
}

const ANYWHERE_RESERVATION_BUSINESS_HOURS = {
  open: '11:00',
  close: '20:00',
}

const ANYWHERE_RESERVATION_INTERVAL_MINUTES = 30

const ANYWHERE_RESERVATION_TIME_SLOTS = createReservationTimeSlots(
  ANYWHERE_RESERVATION_BUSINESS_HOURS,
  ANYWHERE_RESERVATION_INTERVAL_MINUTES,
)

export const useAnywhereReservationForm = () => {
  const [restaurantName, setRestaurantName] = useState('')
  const [restaurantAddress, setRestaurantAddress] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestCounts, setGuestCounts] = useState<ReservationGuestCounts>(
    INITIAL_RESERVATION_GUEST_COUNTS,
  )
  const [visibleMonth, setVisibleMonth] = useState(() =>
    createMonthStart(new Date()),
  )
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [requestNote, setRequestNote] = useState('')
  const minMonth = createMonthStart(new Date())

  const totalGuestCount =
    guestCounts.adult + guestCounts.teen + guestCounts.child
  const isRestaurantNameValid = restaurantName.trim().length > 0
  const isRestaurantAddressValid = restaurantAddress.trim().length > 0
  const isGuestNameValid = guestName.trim().length > 0
  const isSelectedDateValid =
    selectedDate !== undefined && !checkIsTodayOrBefore(selectedDate)
  const canSubmit =
    isRestaurantNameValid &&
    isRestaurantAddressValid &&
    isGuestNameValid &&
    totalGuestCount > 0 &&
    isSelectedDateValid &&
    selectedTime !== undefined

  const handleGuestCountChange = (
    guestType: ReservationGuestType,
    amount: number,
  ) => {
    setGuestCounts((currentGuestCounts) => ({
      ...currentGuestCounts,
      [guestType]: Math.max(0, currentGuestCounts[guestType] + amount),
    }))
  }

  const handleTimeSelect = (time: string) => {
    if (!isSelectedDateValid) {
      return
    }

    setSelectedTime(time)
  }

  const handleDateSelect = (nextDate: Date) => {
    if (selectedDate?.getTime() !== nextDate.getTime()) {
      setSelectedTime(undefined)
    }

    setSelectedDate(nextDate)
  }

  const createAnywhereReservationDraft = ():
    | AnywhereReservationDraft
    | undefined => {
    if (!canSubmit || selectedDate === undefined || !selectedTime) {
      return undefined
    }

    return {
      source: 'anywhere',
      restaurantId: null,
      restaurantName: restaurantName.trim(),
      restaurantAddress: restaurantAddress.trim(),
      restaurantImageUrl: null,
      guestName: guestName.trim(),
      guests: guestCounts,
      date: formatDateToLocalDateString(selectedDate),
      time: selectedTime,
      requestNote,
    }
  }

  return {
    fields: {
      restaurantName: {
        value: restaurantName,
        onValueChange: setRestaurantName,
      },
      restaurantAddress: {
        value: restaurantAddress,
        onValueChange: setRestaurantAddress,
      },
      guestName: {
        value: guestName,
        onValueChange: setGuestName,
      },
      requestNote: {
        value: requestNote,
        onValueChange: setRequestNote,
      },
    },
    guestCounters: RESERVATION_GUEST_COUNTERS.map(({ key, label }) => ({
      key,
      label,
      value: guestCounts[key],
      onDecrease: () => handleGuestCountChange(key, -1),
      onIncrease: () => handleGuestCountChange(key, 1),
    })),
    calendar: {
      isDateDisabled: checkIsTodayOrBefore,
      minMonth,
      visibleMonth,
      selectedDate,
      onDateSelect: handleDateSelect,
      onMonthChange: (nextMonth: Date) => {
        setVisibleMonth(createMonthStart(nextMonth))
      },
    },
    timeSelector: {
      timeSlots: ANYWHERE_RESERVATION_TIME_SLOTS,
      selectedTime,
      disabled: !isSelectedDateValid,
      onTimeSelect: handleTimeSelect,
    },
    submit: {
      canSubmit,
      createAnywhereReservationDraft,
    },
  }
}
