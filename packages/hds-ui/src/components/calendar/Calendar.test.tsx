import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Calendar } from './Calendar'

afterEach(() => {
  cleanup()
})

describe('Calendar', () => {
  it('renders the visible month with weekday labels and month days', () => {
    render(<Calendar month={new Date(2026, 5, 1)} />)

    expect(screen.getByRole('heading', { name: '6월' })).toBeTruthy()
    expect(screen.getAllByText('S')).toHaveLength(2)
    expect(screen.getAllByText('S')[0]?.className).toContain(
      'typo-sub-header-3',
    )
    expect(screen.getAllByText('S')[1]?.className).toContain(
      'typo-sub-header-3',
    )
    expect(screen.getAllByText('S')[0]?.getAttribute('aria-label')).toBe(
      '일요일',
    )
    expect(screen.getAllByText('S')[1]?.getAttribute('aria-label')).toBe(
      '토요일',
    )
    expect(screen.getAllByText('M')[0]?.className).toContain('typo-body-5')
    expect(screen.getByRole('button', { name: '2026년 6월 1일' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '2026년 6월 30일' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: '2026년 6월 31일' })).toBeNull()
  })

  it('marks the selected date and blocks disabled date selection', () => {
    const handleDateSelect = vi.fn()

    render(
      <Calendar
        month={new Date(2026, 5, 1)}
        selectedDate={new Date(2026, 5, 1)}
        disabledDates={[new Date(2026, 5, 6)]}
        onDateSelect={handleDateSelect}
      />,
    )

    const selectedDate = screen.getByRole('button', {
      name: '2026년 6월 1일',
    })
    const disabledDate = screen.getByRole('button', {
      name: '2026년 6월 6일',
    })

    expect(selectedDate.getAttribute('aria-pressed')).toBe('true')
    expect(selectedDate.hasAttribute('aria-selected')).toBe(false)
    expect(selectedDate.className).toContain('size-8')
    expect(
      screen.getByRole('button', { name: '2026년 6월 7일' }).className,
    ).toContain('h-8')
    expect((disabledDate as HTMLButtonElement).disabled).toBe(true)

    fireEvent.click(disabledDate)
    expect(handleDateSelect).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: '2026년 6월 7일' }))
    expect(handleDateSelect).toHaveBeenCalledWith(new Date(2026, 5, 7))
  })

  it('uses disabled callback and calls month change with adjacent months', () => {
    const handleMonthChange = vi.fn()

    render(
      <Calendar
        month={new Date(2026, 5, 1)}
        isDateDisabled={(date) => date.getDate() === 13}
        onMonthChange={handleMonthChange}
      />,
    )

    expect(
      (
        screen.getByRole('button', {
          name: '2026년 6월 13일',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: '이전 달' }))
    fireEvent.click(screen.getByRole('button', { name: '다음 달' }))

    expect(handleMonthChange).toHaveBeenNthCalledWith(1, new Date(2026, 4, 1))
    expect(handleMonthChange).toHaveBeenNthCalledWith(2, new Date(2026, 6, 1))
  })

  it('supports custom date aria label and disables month navigation without handler', () => {
    render(
      <Calendar
        month={new Date(2026, 5, 1)}
        getDateAriaLabel={(date) => `예약 날짜 ${date.getDate()}일`}
      />,
    )

    expect(screen.getByRole('button', { name: '예약 날짜 1일' })).toBeTruthy()
    expect(
      (screen.getByRole('button', { name: '이전 달' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true)
    expect(
      (screen.getByRole('button', { name: '다음 달' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true)
  })

  it('keeps the calendar root background owned by the caller surface', () => {
    render(<Calendar month={new Date(2026, 5, 1)} />)

    expect(screen.getByLabelText('달력').className).not.toContain('bg-white')
  })
})
