import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

afterEach(() => {
  cleanup()
})

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

  it.each([
    ['sm', 'h-7', 'typo-body-6'],
    ['md', 'h-9', 'typo-body-6'],
    ['lg', 'h-10.5', 'typo-sub-header-2'],
    ['xl', 'h-13', 'typo-sub-header-2'],
  ] as const)(
    'maps %s to its redesigned size and typography',
    (size, height, typography) => {
      render(<Button size={size}>{size}</Button>)

      expect(screen.getByRole('button', { name: size })).toHaveClass(
        height,
        typography,
      )
    },
  )

  it('maps each variant to its interaction state tokens', () => {
    render(
      <>
        <Button variant="primary">확인 완료</Button>
        <Button variant="neutral">수정하기</Button>
        <Button variant="destructive">삭제하기</Button>
        <Button variant="ghost">건너뛰기</Button>
      </>,
    )

    expect(screen.getByRole('button', { name: '확인 완료' })).toHaveClass(
      'bg-cool-gray-800',
      'text-white',
      'enabled:hover:bg-cool-gray-700',
      'enabled:active:bg-cool-gray-900',
      'disabled:bg-warm-gray-100',
      'disabled:text-white',
    )
    expect(screen.getByRole('button', { name: '수정하기' })).toHaveClass(
      'bg-secondary-200',
      'text-black',
      'enabled:hover:bg-warm-gray-50',
      'enabled:active:bg-warm-gray-100',
    )
    expect(screen.getByRole('button', { name: '삭제하기' })).toHaveClass(
      'bg-secondary-200',
      'text-primary-400',
      'enabled:hover:bg-warm-gray-50',
      'enabled:active:bg-warm-gray-100',
      'disabled:text-warm-gray-300',
    )
    expect(screen.getByRole('button', { name: '건너뛰기' })).toHaveClass(
      'bg-transparent',
      'px-2.5',
      'text-primary-200',
      'enabled:hover:text-cool-gray-400',
      'enabled:active:text-cool-gray-900',
      'disabled:text-warm-gray-300',
    )
    expect(screen.getByRole('button', { name: '건너뛰기' })).not.toHaveClass(
      'px-4',
    )
  })

  it('hides slot icons while loading', () => {
    render(
      <Button
        loading
        leftIcon={<span data-testid="left-icon" />}
        rightIcon={<span data-testid="right-icon" />}
      >
        처리 중
      </Button>,
    )

    expect(screen.queryByTestId('left-icon')).toBeNull()
    expect(screen.queryByTestId('right-icon')).toBeNull()
    expect(screen.getByRole('button', { name: '처리 중' })).toBeTruthy()
  })
})
