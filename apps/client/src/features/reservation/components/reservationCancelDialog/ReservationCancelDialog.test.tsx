import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ReservationCancelDialog } from '@/features/reservation/components/reservationCancelDialog'

describe('ReservationCancelDialog', () => {
  it('renders close on the left and cancel confirmation on the right', () => {
    const onOpenChange = vi.fn()
    const onConfirmCancelPress = vi.fn()

    render(
      <ReservationCancelDialog
        onConfirmCancelPress={onConfirmCancelPress}
        onOpenChange={onOpenChange}
        open
      />,
    )

    const dialog = screen.getByRole('alertdialog')
    const buttons = within(dialog).getAllByRole('button')

    expect(buttons[0]).toHaveTextContent('닫기')
    expect(buttons[1]).toHaveTextContent('취소하기')

    fireEvent.click(buttons[0])
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onConfirmCancelPress).not.toHaveBeenCalled()

    fireEvent.click(buttons[1])
    expect(onConfirmCancelPress).toHaveBeenCalledTimes(1)
  })
})
