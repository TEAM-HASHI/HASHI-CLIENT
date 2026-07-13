import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  RESERVATION_REQUEST_NOTE_MAX_LENGTH,
  ReservationRequestNoteField,
} from '@/features/reservation/components/reservationRequestNoteField/ReservationRequestNoteField'

afterEach(cleanup)

describe('ReservationRequestNoteField', () => {
  it('renders the optional label and 1000-character counter', () => {
    render(<ReservationRequestNoteField onValueChange={vi.fn()} value="" />)

    expect(
      screen.getByRole('textbox', { name: '요청사항 (선택)' }),
    ).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('/1000')).toBeInTheDocument()
  })

  it('uses a thin HASHI point-color border instead of the HDS focus outline', () => {
    render(<ReservationRequestNoteField onValueChange={vi.fn()} value="" />)

    const requestNoteField = screen.getByRole('textbox', {
      name: '요청사항 (선택)',
    })

    expect(requestNoteField).toHaveClass(
      'focus-visible:border-primary-400',
      'focus-visible:outline-0',
    )
    expect(requestNoteField).not.toHaveClass(
      'focus-visible:border-cool-gray-500',
    )
    expect(requestNoteField).not.toHaveClass('focus-visible:outline-2')
  })

  it('passes the next request note to the controlled change callback', () => {
    const handleValueChange = vi.fn()
    render(
      <ReservationRequestNoteField
        onValueChange={handleValueChange}
        value=""
      />,
    )

    fireEvent.change(screen.getByRole('textbox', { name: '요청사항 (선택)' }), {
      target: { value: '창가 자리 부탁드립니다' },
    })

    expect(handleValueChange).toHaveBeenCalledWith('창가 자리 부탁드립니다')
  })

  it('limits typed or pasted content to 1000 characters', () => {
    const handleValueChange = vi.fn()
    render(
      <ReservationRequestNoteField
        onValueChange={handleValueChange}
        value=""
      />,
    )

    const overLimitValue = '가'.repeat(RESERVATION_REQUEST_NOTE_MAX_LENGTH + 1)
    fireEvent.change(screen.getByRole('textbox', { name: '요청사항 (선택)' }), {
      target: { value: overLimitValue },
    })

    expect(handleValueChange).toHaveBeenCalledWith(
      '가'.repeat(RESERVATION_REQUEST_NOTE_MAX_LENGTH),
    )
  })

  it('limits an overlong controlled value and counter to 1000 characters', () => {
    render(
      <ReservationRequestNoteField
        onValueChange={vi.fn()}
        value={'가'.repeat(RESERVATION_REQUEST_NOTE_MAX_LENGTH + 1)}
      />,
    )

    expect(
      screen.getByRole('textbox', { name: '요청사항 (선택)' }),
    ).toHaveValue('가'.repeat(RESERVATION_REQUEST_NOTE_MAX_LENGTH))
    expect(screen.getByText('1000')).toBeInTheDocument()
  })
})
