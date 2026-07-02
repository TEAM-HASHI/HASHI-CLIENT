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
    expect(screen.getByRole('button', { name: '1' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '30' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: '31' })).toBeNull()
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

    const selectedDate = screen.getByRole('button', { name: '1' })
    const disabledDate = screen.getByRole('button', { name: '6' })

    expect(selectedDate.getAttribute('aria-pressed')).toBe('true')
    expect(selectedDate.hasAttribute('aria-selected')).toBe(false)
    expect((disabledDate as HTMLButtonElement).disabled).toBe(true)

    fireEvent.click(disabledDate)
    expect(handleDateSelect).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: '7' }))
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
      (screen.getByRole('button', { name: '13' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: '이전 달' }))
    fireEvent.click(screen.getByRole('button', { name: '다음 달' }))

    expect(handleMonthChange).toHaveBeenNthCalledWith(1, new Date(2026, 4, 1))
    expect(handleMonthChange).toHaveBeenNthCalledWith(2, new Date(2026, 6, 1))
  })
})
