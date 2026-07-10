import { useMemo, useState } from 'react'

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
import type { ReservationRestaurant } from '@/pages/restaurantReservationNew/hooks/useReservationRestaurant'

interface UseRestaurantReservationFormParams {
  restaurant: ReservationRestaurant
}

export interface ReservationDraft {
  restaurantId: string
  restaurantName: string
  guestName: string
  guests: ReservationGuestCounts
  date: string
  time: string
  requestNote: string
}

export const useRestaurantReservationForm = ({
  restaurant,
}: UseRestaurantReservationFormParams) => {
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

  const timeSlots = useMemo(
    () =>
      createReservationTimeSlots(
        restaurant.businessHours,
        restaurant.reservationIntervalMinutes,
      ),
    [restaurant.businessHours, restaurant.reservationIntervalMinutes],
  )

  const totalGuestCount =
    guestCounts.adult + guestCounts.teen + guestCounts.child
  const isGuestNameValid = guestName.trim().length > 0
  const isSelectedDateValid =
    selectedDate !== undefined && !checkIsTodayOrBefore(selectedDate)
  const canSubmit =
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

  const createReservationDraft = (): ReservationDraft | undefined => {
    if (!canSubmit || selectedDate === undefined || !selectedTime) {
      return undefined
    }

    return {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      guestName: guestName.trim(),
      guests: guestCounts,
      date: formatDateToLocalDateString(selectedDate),
      time: selectedTime,
      requestNote,
    }
  }

  return {
    fields: {
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
      timeSlots,
      selectedTime,
      disabled: !isSelectedDateValid,
      onTimeSelect: handleTimeSelect,
    },
    submit: {
      canSubmit,
      createReservationDraft,
    },
  }
}
