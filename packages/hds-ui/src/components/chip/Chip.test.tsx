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
      'hover:bg-cool-gray-700',
      'active:bg-cool-gray-900',
      'text-white',
    )
    expect(screen.getByText('미선택').parentElement).toHaveClass(
      'bg-warm-gray-50',
      'hover:bg-warm-gray-100',
      'active:bg-warm-gray-300',
      'text-primary-200',
    )
  })

  it('applies basic chip layout and typography from the redesign', () => {
    render(<Chip>라벨</Chip>)

    const chip = screen.getByRole('button', { name: '라벨' })

    expect(chip).toHaveClass('h-9', 'gap-0.5', 'rounded-full', 'px-3', 'py-2')
    expect(screen.getByText('라벨')).toHaveClass('typo-body-6')
  })

  it('renders an optional basic count label', () => {
    render(<Chip count={12}>라벨</Chip>)

    expect(screen.getByRole('button', { name: '라벨 12' })).toBeInTheDocument()
    expect(screen.getByText('12')).toHaveClass('typo-caption-1')
  })

  it('renders zero when count is 0', () => {
    render(<Chip count={0}>라벨</Chip>)

    expect(screen.getByRole('button', { name: '라벨 0' })).toBeInTheDocument()
  })

  it('renders an icon chip with icon and label', () => {
    render(
      <Chip icon={<span data-testid="chip-icon">아이콘</span>} variant="icon">
        친절해요
      </Chip>,
    )

    const chip = screen.getByRole('button', { name: '친절해요' })

    expect(chip).toHaveClass(
      'h-9',
      'gap-1',
      'rounded-[5px]',
      'border',
      'border-warm-gray-100',
      'bg-white',
      'px-2.5',
      'py-1',
    )
    expect(screen.getByTestId('chip-icon').parentElement).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    expect(screen.getByText('친절해요')).toHaveClass('typo-body-8')
  })

  it('applies icon chip selected styles', () => {
    render(
      <Chip icon={<span />} selected variant="icon">
        친절해요
      </Chip>,
    )

    expect(screen.getByRole('button', { name: '친절해요' })).toHaveClass(
      'border-[1.4px]',
      'border-primary-400',
      'bg-primary-400/20',
      'enabled:hover:bg-primary-400/30',
      'enabled:active:bg-primary-400/50',
    )
  })

  it('does not call onSelectedChange and renders disabledIcon when icon chip is disabled', () => {
    const handleSelectedChange = vi.fn()

    render(
      <Chip
        disabled
        disabledIcon={<span data-testid="disabled-icon">비활성 아이콘</span>}
        icon={<span data-testid="enabled-icon">아이콘</span>}
        onSelectedChange={handleSelectedChange}
        variant="icon"
      >
        친절해요
      </Chip>,
    )

    const chip = screen.getByRole('button', { name: '친절해요' })

    expect(chip).toBeDisabled()
    expect(chip).toHaveClass(
      'disabled:bg-primary-100',
      'disabled:text-warm-gray-300',
    )
    expect(screen.queryByTestId('enabled-icon')).not.toBeInTheDocument()
    expect(screen.getByTestId('disabled-icon')).toBeInTheDocument()

    fireEvent.click(chip)

    expect(handleSelectedChange).not.toHaveBeenCalled()
  })

  it('keeps disabled icon chip styles first when disabled and selected are both true', () => {
    render(
      <Chip disabled icon={<span />} selected variant="icon">
        친절해요
      </Chip>,
    )

    const chip = screen.getByRole('button', { name: '친절해요' })

    expect(chip).toBeDisabled()
    expect(chip).toHaveAttribute('aria-pressed', 'true')
    expect(chip).toHaveClass(
      'disabled:border-warm-gray-100',
      'disabled:bg-primary-100',
      'disabled:text-warm-gray-300',
      'enabled:hover:bg-primary-400/30',
      'enabled:active:bg-primary-400/50',
    )
  })
})
