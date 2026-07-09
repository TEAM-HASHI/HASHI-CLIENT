import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GuestCounter } from '@/features/reservation/components/guestCounter/GuestCounter'

describe('GuestCounter', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders label, value, controls, and reservation counter styles', () => {
    render(
      <GuestCounter
        label="어른"
        value={2}
        onDecrease={() => undefined}
        onIncrease={() => undefined}
      />,
    )

    expect(screen.getByText('어른')).toHaveClass(
      'typo-body-4',
      'text-primary-200',
    )
    expect(screen.getByText('2')).toHaveClass(
      'typo-body-4',
      'text-primary-200',
      'w-[25px]',
      'shrink-0',
      'text-center',
      'tabular-nums',
    )
    expect(
      screen.getByRole('button', { name: '어른 인원 줄이기' }),
    ).toBeEnabled()
    expect(
      screen.getByRole('button', { name: '어른 인원 늘리기' }),
    ).toBeEnabled()
    expect(
      screen.getByRole('button', { name: '어른 인원 줄이기' }),
    ).toHaveClass(
      'size-6',
      'appearance-none',
      'rounded-full',
      'border-[1.4px]',
      'border-black',
    )
    expect(
      screen.getByRole('button', { name: '어른 인원 늘리기' }),
    ).toHaveClass(
      'size-6',
      'appearance-none',
      'rounded-full',
      'border-[1.4px]',
      'border-black',
    )
    expect(
      screen
        .getByRole('button', { name: '어른 인원 줄이기' })
        .querySelector('svg'),
    ).toHaveClass('size-6', 'scale-[1.4]')
    expect(
      screen
        .getByRole('button', { name: '어른 인원 늘리기' })
        .querySelector('svg'),
    ).toHaveClass('size-6', 'scale-[1.4]')
    expect(screen.getByTestId('guest-counter')).toHaveClass(
      'border-b',
      'border-warm-gray-100',
    )
  })

  it('calls decrease and increase callbacks when controls are clicked', () => {
    const handleDecrease = vi.fn()
    const handleIncrease = vi.fn()

    render(
      <GuestCounter
        label="청소년"
        value={1}
        onDecrease={handleDecrease}
        onIncrease={handleIncrease}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '청소년 인원 줄이기' }))
    fireEvent.click(screen.getByRole('button', { name: '청소년 인원 늘리기' }))

    expect(handleDecrease).toHaveBeenCalledTimes(1)
    expect(handleIncrease).toHaveBeenCalledTimes(1)
  })

  it('keeps decrease disabled at zero while increase remains available', () => {
    const handleDecrease = vi.fn()
    const handleIncrease = vi.fn()

    render(
      <GuestCounter
        label="어린이"
        value={0}
        onDecrease={handleDecrease}
        onIncrease={handleIncrease}
      />,
    )

    const decreaseButton = screen.getByRole('button', {
      name: '어린이 인원 줄이기',
    })
    const increaseButton = screen.getByRole('button', {
      name: '어린이 인원 늘리기',
    })

    expect(decreaseButton).toBeDisabled()
    expect(increaseButton).toBeEnabled()

    fireEvent.click(decreaseButton)
    fireEvent.click(increaseButton)

    expect(handleDecrease).not.toHaveBeenCalled()
    expect(handleIncrease).toHaveBeenCalledTimes(1)
  })

  it('disables both controls when disabled', () => {
    render(
      <GuestCounter
        disabled
        label="어른"
        value={3}
        onDecrease={() => undefined}
        onIncrease={() => undefined}
      />,
    )

    expect(
      screen.getByRole('button', { name: '어른 인원 줄이기' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: '어른 인원 늘리기' }),
    ).toBeDisabled()
  })
})
