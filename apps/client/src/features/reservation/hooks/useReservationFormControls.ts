import { useCallback, useMemo, useState } from 'react'

import {
  INITIAL_RESERVATION_GUEST_COUNTS,
  RESERVATION_GUEST_COUNTERS,
} from '@/features/reservation/constants/guest'
import type {
  ReservationGuestCounts,
  ReservationGuestType,
} from '@/features/reservation/constants/guest'
import { checkIsTodayOrBefore, createMonthStart } from '@/shared/utils/date'

interface UseReservationFormControlsParams {
  checkIsDateReservable: (date: Date) => boolean
  getTimeSlots: (selectedDate: Date | undefined) => readonly string[]
}

export const useReservationFormControls = ({
  checkIsDateReservable,
  getTimeSlots,
}: UseReservationFormControlsParams) => {
  const [guestName, setGuestName] = useState('')
  const [guestCounts, setGuestCounts] = useState<ReservationGuestCounts>(
    INITIAL_RESERVATION_GUEST_COUNTS,
  )
  const [requestNote, setRequestNote] = useState('')
  const [visibleMonth, setVisibleMonth] = useState(() =>
    createMonthStart(new Date()),
  )
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const minMonth = createMonthStart(new Date())

  const checkIsDateDisabled = useCallback(
    (date: Date) => checkIsTodayOrBefore(date) || !checkIsDateReservable(date),
    [checkIsDateReservable],
  )

  const isSelectedDateValid =
    selectedDate !== undefined && !checkIsDateDisabled(selectedDate)
  const totalGuestCount =
    guestCounts.adult + guestCounts.teen + guestCounts.child
  const isGuestNameValid = guestName.trim().length > 0
  const timeSlots = useMemo(
    () => getTimeSlots(selectedDate),
    [getTimeSlots, selectedDate],
  )

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
    validity: {
      totalGuestCount,
      isGuestNameValid,
      isSelectedDateValid,
      hasSelectedTime: selectedTime !== undefined,
    },
    values: {
      guestCounts,
      selectedDate,
      selectedTime,
    },
    calendar: {
      isDateDisabled: checkIsDateDisabled,
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
  }
}
