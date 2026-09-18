import '@testing-library/jest-dom/vitest'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Badge } from './Badge'

afterEach(() => {
  cleanup()
})

describe('Badge', () => {
  it('interactive가 false이면 정적 span으로 렌더링합니다', () => {
    render(<Badge label="정적 라벨" />)

    expect(screen.getByText('정적 라벨').closest('span')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('interactive가 true이면 button으로 렌더링합니다', () => {
    render(<Badge interactive label="선택 라벨" />)

    expect(screen.getByRole('button', { name: '선택 라벨' })).toHaveAttribute(
      'type',
      'button',
    )
  })

  it('선택되지 않은 interactive badge를 누르면 true를 전달합니다', () => {
    const handleSelectedChange = vi.fn()

    render(
      <Badge
        interactive
        label="선택 라벨"
        onSelectedChange={handleSelectedChange}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '선택 라벨' }))

    expect(handleSelectedChange).toHaveBeenCalledTimes(1)
    expect(handleSelectedChange).toHaveBeenCalledWith(true)
  })

  it('선택된 interactive badge를 누르면 false를 전달합니다', () => {
    const handleSelectedChange = vi.fn()

    render(
      <Badge
        interactive
        label="선택 라벨"
        onSelectedChange={handleSelectedChange}
        selected
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '선택 라벨' }))

    expect(handleSelectedChange).toHaveBeenCalledTimes(1)
    expect(handleSelectedChange).toHaveBeenCalledWith(false)
  })

  it('선택 상태를 aria-pressed로 노출합니다', () => {
    render(<Badge interactive label="선택 라벨" selected />)

    expect(screen.getByRole('button', { name: '선택 라벨' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('aria-disabled가 true이면 선택 변경을 호출하지 않습니다', () => {
    const handleSelectedChange = vi.fn()

    render(
      <Badge
        aria-disabled="true"
        interactive
        label="선택 라벨"
        onSelectedChange={handleSelectedChange}
      />,
    )

    const badge = screen.getByRole('button', { name: '선택 라벨' })

    expect(badge).toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(badge)

    expect(handleSelectedChange).not.toHaveBeenCalled()
  })

  it('아이콘은 accessible name에 포함하지 않고 visible label을 이름으로 사용합니다', () => {
    render(
      <Badge
        icon={<span data-testid="badge-icon">아이콘 텍스트</span>}
        interactive
        label="선택 라벨"
      />,
    )

    expect(
      screen.getByRole('button', { name: '선택 라벨' }),
    ).toBeInTheDocument()
  })

  it('aria-disabled가 true이면 disabledIcon을 우선 표시합니다', () => {
    render(
      <Badge
        aria-disabled="true"
        disabledIcon={<span data-testid="disabled-icon">비활성 아이콘</span>}
        icon={<span data-testid="enabled-icon">아이콘</span>}
        interactive
        label="선택 라벨"
      />,
    )

    expect(screen.queryByTestId('enabled-icon')).not.toBeInTheDocument()
    expect(screen.getByTestId('disabled-icon')).toBeInTheDocument()
  })

  it('aria-disabled가 true이면 선택 상태여도 비활성 스타일을 우선 적용합니다', () => {
    render(
      <Badge aria-disabled="true" interactive label="선택 라벨" selected />,
    )

    const badge = screen.getByRole('button', { name: '선택 라벨' })

    expect(badge).toHaveAttribute('aria-pressed', 'true')
    expect(badge).not.toHaveClass('border-[1.4px]', 'border-primary-400')
    expect(badge).toHaveClass('border-warm-gray-100', 'bg-primary-100')
  })
})
