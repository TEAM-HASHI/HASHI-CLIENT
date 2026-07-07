import { useMemo, useState } from 'react'

import { createReservationTimeSlots } from '@/pages/restaurantReservationNew/utils/createReservationTimeSlots'
import {
  checkIsTodayOrBefore,
  createMonthStart,
  formatDateToLocalDateString,
} from '@/shared/utils/date'
import type { ReservationRestaurant } from '@/pages/restaurantReservationNew/hooks/useReservationRestaurant'

type GuestType = 'adult' | 'teen' | 'child'

type GuestCounts = Record<GuestType, number>

interface UseRestaurantReservationFormParams {
  restaurant: ReservationRestaurant
}

export interface ReservationDraft {
  restaurantId: string
  restaurantName: string
  guestName: string
  guests: GuestCounts
  date: string
  time: string
  requestNote: string
}

const GUEST_COUNTERS = [
  { key: 'adult', label: '어른' },
  { key: 'teen', label: '청소년' },
  { key: 'child', label: '어린이' },
] satisfies { key: GuestType; label: string }[]

const INITIAL_GUEST_COUNTS = {
  adult: 0,
  teen: 0,
  child: 0,
} satisfies GuestCounts

export const useRestaurantReservationForm = ({
  restaurant,
}: UseRestaurantReservationFormParams) => {
  const [guestName, setGuestName] = useState('')
  const [guestCounts, setGuestCounts] =
    useState<GuestCounts>(INITIAL_GUEST_COUNTS)
  const [visibleMonth, setVisibleMonth] = useState(() =>
    createMonthStart(new Date()),
  )
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [requestNote, setRequestNote] = useState('')

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

  const handleGuestCountChange = (guestType: GuestType, amount: number) => {
    setGuestCounts((currentGuestCounts) => ({
      ...currentGuestCounts,
      [guestType]: Math.max(0, currentGuestCounts[guestType] + amount),
    }))
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
    guestCounters: GUEST_COUNTERS.map(({ key, label }) => ({
      key,
      label,
      value: guestCounts[key],
      onDecrease: () => handleGuestCountChange(key, -1),
      onIncrease: () => handleGuestCountChange(key, 1),
    })),
    calendar: {
      isDateDisabled: checkIsTodayOrBefore,
      visibleMonth,
      selectedDate,
      onDateSelect: setSelectedDate,
      onMonthChange: (nextMonth: Date) => {
        setVisibleMonth(createMonthStart(nextMonth))
      },
    },
    timeSelector: {
      timeSlots,
      selectedTime,
      onTimeSelect: setSelectedTime,
    },
    submit: {
      canSubmit,
      createReservationDraft,
    },
  }
}
