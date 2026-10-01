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
  it('limits dates to the next three calendar months, including the boundary', () => {
    const { result } = renderHook(() =>
      useReservationFormControls({
        checkIsDateReservable: () => true,
        getTimeSlots: () => ['11:00'],
      }),
    )
    expect(result.current.calendar.isDateDisabled(new Date(2026, 8, 1))).toBe(
      false,
    )
    expect(result.current.calendar.isDateDisabled(new Date(2026, 8, 2))).toBe(
      true,
    )
  })

  it('clamps the three-month boundary at the last day of a shorter month', () => {
    vi.setSystemTime(new Date(2026, 0, 31, 9))
    const { result } = renderHook(() =>
      useReservationFormControls({
        checkIsDateReservable: () => true,
        getTimeSlots: () => ['11:00'],
      }),
    )
    expect(result.current.calendar.isDateDisabled(new Date(2026, 3, 30))).toBe(
      false,
    )
    expect(result.current.calendar.isDateDisabled(new Date(2026, 4, 1))).toBe(
      true,
    )
  })

  it('caps every guest type at 100 and rejects names longer than 50 trimmed characters', () => {
    const { result } = renderHook(() =>
      useReservationFormControls({
        checkIsDateReservable: () => true,
        getTimeSlots: () => ['11:00'],
      }),
    )
    act(() => {
      for (const counter of result.current.guestCounters)
        for (let i = 0; i < 105; i++) counter.onIncrease()
      result.current.fields.guestName.onValueChange('가'.repeat(51))
    })
    expect(
      result.current.guestCounters.map((counter) => counter.value),
    ).toEqual([100, 100, 100])
    expect(result.current.validity.isGuestNameValid).toBe(false)
    act(() =>
      result.current.fields.guestName.onValueChange(
        '  ' + '가'.repeat(50) + '  ',
      ),
    )
    expect(result.current.validity.isGuestNameValid).toBe(true)
  })
})
