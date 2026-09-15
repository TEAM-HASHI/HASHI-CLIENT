import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { IconButton } from './IconButton'

const TestIcon = () => <svg data-testid="test-icon" />

afterEach(() => {
  cleanup()
})

describe('IconButton', () => {
  it('renders a native button with a required accessible name', () => {
    render(
      <IconButton aria-label="뒤로가기">
        <TestIcon />
      </IconButton>,
    )

    expect(screen.getByRole('button', { name: '뒤로가기' })).toBeTruthy()
  })

  it('uses type="button" by default', () => {
    render(
      <IconButton aria-label="뒤로가기">
        <TestIcon />
      </IconButton>,
    )

    expect(screen.getByRole('button').getAttribute('type')).toBe('button')
  })

  it('allows submit type', () => {
    render(
      <IconButton aria-label="저장하기" type="submit">
        <TestIcon />
      </IconButton>,
    )

    expect(screen.getByRole('button').getAttribute('type')).toBe('submit')
  })

  it('renders the 36px soft icon button surface', () => {
    render(
      <IconButton aria-label="수정하기" size="sm" variant="soft">
        <TestIcon />
      </IconButton>,
    )

    expect(screen.getByRole('button', { name: '수정하기' })).toHaveClass(
      'size-9',
      'rounded-full',
      'bg-white',
      'enabled:hover:bg-primary-100',
      'enabled:active:bg-warm-gray-100',
    )
  })

  it('blocks interaction while loading and exposes busy state', () => {
    const handleClick = vi.fn()

    render(
      <IconButton aria-label="저장 중" loading onClick={handleClick}>
        <TestIcon />
      </IconButton>,
    )

    const button = screen.getByRole('button', { name: '저장 중' })

    expect((button as HTMLButtonElement).disabled).toBe(true)
    expect(button.getAttribute('aria-busy')).toBe('true')
    expect(screen.queryByTestId('test-icon')).toBeNull()

    fireEvent.click(button)

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('blocks interaction when disabled', () => {
    const handleClick = vi.fn()

    render(
      <IconButton aria-label="공유하기" disabled onClick={handleClick}>
        <TestIcon />
      </IconButton>,
    )

    const button = screen.getByRole('button', { name: '공유하기' })

    expect((button as HTMLButtonElement).disabled).toBe(true)

    fireEvent.click(button)

    expect(handleClick).not.toHaveBeenCalled()
  })
})
