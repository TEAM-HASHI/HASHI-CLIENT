import '@testing-library/jest-dom/vitest'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Chip } from './Chip'

afterEach(() => {
  cleanup()
})

describe('Chip', () => {
  it('renders a filter chip as a button', () => {
    render(<Chip selected>진행 중</Chip>)

    expect(screen.getByRole('button', { name: '진행 중' })).toBeInTheDocument()
  })

  it('exposes pressed state when selected', () => {
    render(<Chip selected>인기순</Chip>)

    expect(screen.getByRole('button', { name: '인기순' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('calls onSelectedChange with the next selected state', () => {
    const handleSelectedChange = vi.fn()

    render(<Chip onSelectedChange={handleSelectedChange}>지역별</Chip>)

    fireEvent.click(screen.getByRole('button', { name: '지역별' }))

    expect(handleSelectedChange).toHaveBeenCalledTimes(1)
    expect(handleSelectedChange).toHaveBeenCalledWith(true)
  })

  it('calls onSelectedChange with false when selected chip is clicked', () => {
    const handleSelectedChange = vi.fn()

    render(
      <Chip selected onSelectedChange={handleSelectedChange}>
        지역별
      </Chip>,
    )

    fireEvent.click(screen.getByRole('button', { name: '지역별' }))

    expect(handleSelectedChange).toHaveBeenCalledTimes(1)
    expect(handleSelectedChange).toHaveBeenCalledWith(false)
  })

  it('applies selected and unselected styles', () => {
    render(
      <>
        <Chip selected>선택</Chip>
        <Chip>미선택</Chip>
      </>,
    )

    expect(screen.getByText('선택').parentElement).toHaveClass(
      'bg-cool-gray-800',
      'text-white',
    )
    expect(screen.getByText('미선택').parentElement).toHaveClass(
      'bg-warm-gray-50',
      'text-primary-200',
    )
  })
})
