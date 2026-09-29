import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TimeSlotPicker } from './TimeSlotPicker'

afterEach(cleanup)

describe('TimeSlotPicker', () => {
  it('renders supplied labels in order without generating or selecting times', () => {
    render(<TimeSlotPicker timeSlots={['23:30', '00:00', '오전 9:00']} />)

    expect(screen.getByRole('group', { name: '시간' })).toBeTruthy()
    expect(
      screen.getAllByRole('button').map((button) => button.textContent),
    ).toEqual(['23:30', '00:00', '오전 9:00'])
    expect(screen.queryByRole('button', { pressed: true })).toBeNull()
  })

  it('reports the clicked value and leaves selection under caller control', () => {
    const onTimeSelect = vi.fn()
    const { rerender } = render(
      <TimeSlotPicker
        timeSlots={['11:00', '11:30']}
        selectedTime="11:00"
        onTimeSelect={onTimeSelect}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '11:30' }))

    expect(onTimeSelect).toHaveBeenCalledExactlyOnceWith('11:30')
    expect(
      screen.getByRole('button', { name: '11:00', pressed: true }),
    ).toBeTruthy()

    rerender(
      <TimeSlotPicker
        timeSlots={['11:00', '11:30']}
        selectedTime="11:30"
        onTimeSelect={onTimeSelect}
      />,
    )
    expect(
      screen.getByRole('button', { name: '11:30', pressed: true }),
    ).toBeTruthy()

    rerender(
      <TimeSlotPicker timeSlots={['12:00']} onTimeSelect={onTimeSelect} />,
    )
    expect(screen.queryByRole('button', { pressed: true })).toBeNull()
    expect(screen.queryByRole('button', { name: '11:30' })).toBeNull()
  })

  it('disables every button and does not report a selection', () => {
    const onTimeSelect = vi.fn()
    render(
      <TimeSlotPicker
        disabled
        timeSlots={['11:00', '11:30']}
        selectedTime="11:00"
        onTimeSelect={onTimeSelect}
      />,
    )

    screen.getAllByRole('button').forEach((button) => {
      expect((button as HTMLButtonElement).disabled).toBe(true)
      fireEvent.click(button)
    })
    expect(onTimeSelect).not.toHaveBeenCalled()
  })

  it('does not submit a containing form when choosing a time', () => {
    const onSubmit = vi.fn((event: { preventDefault: () => void }) =>
      event.preventDefault(),
    )
    render(
      <form onSubmit={onSubmit}>
        <TimeSlotPicker timeSlots={['11:00']} />
      </form>,
    )

    fireEvent.click(screen.getByRole('button', { name: '11:00' }))

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('supports an external group label and an empty list without product copy', () => {
    render(
      <>
        <h2 id="time-heading">출발 시각</h2>
        <TimeSlotPicker aria-labelledby="time-heading" timeSlots={[]} />
      </>,
    )

    expect(screen.getByRole('group', { name: '출발 시각' }).textContent).toBe(
      '',
    )
    expect(screen.queryByRole('button')).toBeNull()
  })
})
