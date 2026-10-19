import { useCallback, useMemo, useState } from 'react'

import {
  INITIAL_RESERVATION_GUEST_COUNTS,
  RESERVATION_GUEST_COUNTERS,
} from '@/features/reservation/constants/guest'
import type {
  ReservationGuestCounts,
  ReservationGuestType,
} from '@/features/reservation/constants/guest'
import type { ReservationRequestDraft } from '@/features/reservation/reservationDraft'
import {
  createDayStart,
  checkIsTodayOrBefore,
  createMonthStart,
} from '@/shared/utils/date'

interface UseReservationFormControlsParams {
  initialDraft?: ReservationRequestDraft | null
  checkIsDateReservable: (date: Date) => boolean
  getTimeSlots: (selectedDate: Date | undefined) => readonly string[]
}

export const useReservationFormControls = ({
  checkIsDateReservable,
  getTimeSlots,
  initialDraft,
}: UseReservationFormControlsParams) => {
  const [guestName, setGuestName] = useState(initialDraft?.guestName ?? '')
  const [guestCounts, setGuestCounts] = useState<ReservationGuestCounts>(
    initialDraft?.guests ?? INITIAL_RESERVATION_GUEST_COUNTS,
  )
  const [requestNote, setRequestNote] = useState(
    initialDraft?.requestNote ?? '',
  )
  const [visibleMonth, setVisibleMonth] = useState(() =>
    createMonthStart(
      initialDraft ? new Date(`${initialDraft.date}T00:00:00`) : new Date(),
    ),
  )
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() =>
    initialDraft ? new Date(`${initialDraft.date}T00:00:00`) : undefined,
  )
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    initialDraft?.time,
  )
  const minMonth = createMonthStart(new Date())

  const checkIsDateDisabled = useCallback(
    (date: Date) => {
      const today = new Date()
      const lastDay = new Date(
        today.getFullYear(),
        today.getMonth() + 4,
        0,
      ).getDate()
      const maxDate = new Date(
        today.getFullYear(),
        today.getMonth() + 3,
        Math.min(today.getDate(), lastDay),
      )
      return (
        checkIsTodayOrBefore(date) ||
        createDayStart(date) > maxDate ||
        !checkIsDateReservable(date)
      )
    },
    [checkIsDateReservable],
  )

  const isSelectedDateValid =
    selectedDate !== undefined && !checkIsDateDisabled(selectedDate)
  const totalGuestCount =
    guestCounts.adult + guestCounts.teen + guestCounts.child
  const isGuestNameValid =
    guestName.trim().length > 0 && guestName.trim().length <= 50
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
      [guestType]: Math.min(
        100,
        Math.max(0, currentGuestCounts[guestType] + amount),
      ),
    }))
  }

  const handleTimeSelect = (time: string) => {
    if (!isSelectedDateValid || !timeSlots.includes(time)) {
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

  const hasChanges = Boolean(
    guestName || requestNote || totalGuestCount || selectedDate || selectedTime,
  )

  return {
    hasChanges,
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
      hasSelectedTime:
        selectedTime !== undefined && timeSlots.includes(selectedTime),
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
