import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useReservationFormControls } from '@/features/reservation/hooks/useReservationFormControls'

describe('useReservationFormControls', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 1, 9))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('ignores time selection before a valid date and clears selected time when the date changes', () => {
    const { result } = renderHook(() =>
      useReservationFormControls({
        checkIsDateReservable: () => true,
        getTimeSlots: (selectedDate) => (selectedDate ? ['12:00'] : ['11:00']),
      }),
    )

    act(() => {
      result.current.timeSelector.onTimeSelect('11:00')
    })

    expect(result.current.timeSelector.selectedTime).toBeUndefined()

    act(() => {
      result.current.calendar.onDateSelect(new Date(2026, 5, 2))
    })

    act(() => {
      result.current.timeSelector.onTimeSelect('12:00')
    })

    expect(result.current.timeSelector.selectedTime).toBe('12:00')

    act(() => {
      result.current.calendar.onDateSelect(new Date(2026, 5, 3))
    })

    expect(result.current.timeSelector.selectedTime).toBeUndefined()
  })

  it('keeps guest counts non-negative and exposes shared text-field validity', () => {
    const { result } = renderHook(() =>
      useReservationFormControls({
        checkIsDateReservable: () => true,
        getTimeSlots: () => ['11:00'],
      }),
    )

    const adultCounter = result.current.guestCounters.find(
      ({ key }) => key === 'adult',
    )

    act(() => {
      adultCounter?.onDecrease()
      adultCounter?.onIncrease()
      result.current.fields.guestName.onValueChange('  김하시  ')
      result.current.fields.requestNote.onValueChange('창가 자리 부탁드립니다')
    })

    expect(
      result.current.guestCounters.find(({ key }) => key === 'adult')?.value,
    ).toBe(1)
    expect(result.current.validity.totalGuestCount).toBe(1)
    expect(result.current.validity.isGuestNameValid).toBe(true)
    expect(result.current.fields.guestName.value).toBe('  김하시  ')
    expect(result.current.fields.requestNote.value).toBe(
      '창가 자리 부탁드립니다',
    )
  })

  it('exposes selected reservation values for page-specific draft creation', () => {
    const { result } = renderHook(() =>
      useReservationFormControls({
        checkIsDateReservable: () => true,
        getTimeSlots: () => ['11:00'],
      }),
    )

    act(() => {
      result.current.guestCounters[0]?.onIncrease()
      result.current.calendar.onDateSelect(new Date(2026, 5, 2))
    })

    act(() => {
      result.current.timeSelector.onTimeSelect('11:00')
    })

    expect(result.current.values).toMatchObject({
      guestCounts: { adult: 1, teen: 0, child: 0 },
      selectedDate: new Date(2026, 5, 2),
      selectedTime: '11:00',
    })
  })
})
