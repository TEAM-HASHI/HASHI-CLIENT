import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('uses type="button" by default', () => {
    render(<Button>확인</Button>)

    expect(
      screen.getByRole('button', { name: '확인' }).getAttribute('type'),
    ).toBe('button')
  })

  it('allows submit type', () => {
    render(<Button type="submit">저장</Button>)

    expect(
      screen.getByRole('button', { name: '저장' }).getAttribute('type'),
    ).toBe('submit')
  })

  it('blocks interaction while loading', () => {
    const handleClick = vi.fn()

    render(
      <Button loading onClick={handleClick}>
        처리 중
      </Button>,
    )

    const button = screen.getByRole('button', { name: '처리 중' })

    expect(button.hasAttribute('disabled')).toBe(true)
    expect(button.getAttribute('aria-busy')).toBe('true')

    fireEvent.click(button)

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renders left and right icons as decorative content', () => {
    render(
      <Button
        leftIcon={<span data-testid="left-icon" />}
        rightIcon={<span data-testid="right-icon" />}
      >
        더보기
      </Button>,
    )

    expect(screen.getByTestId('left-icon')).toBeTruthy()
    expect(screen.getByTestId('right-icon')).toBeTruthy()
    expect(screen.getByRole('button', { name: '더보기' })).toBeTruthy()
  })
})
