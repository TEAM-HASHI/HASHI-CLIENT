import '@testing-library/jest-dom/vitest'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { OptionItem } from './OptionItem'

afterEach(() => {
  cleanup()
})

describe('OptionItem', () => {
  it('button으로 렌더링하고 type button을 제공합니다', () => {
    render(<OptionItem>버튼</OptionItem>)

    expect(screen.getByRole('button', { name: '버튼' })).toHaveAttribute(
      'type',
      'button',
    )
  })

  it('selected 상태를 aria-pressed로 노출하고 체크 아이콘을 렌더링합니다', () => {
    render(<OptionItem selected>버튼</OptionItem>)

    const optionItem = screen.getByRole('button', { name: '버튼' })

    expect(optionItem).toHaveAttribute('aria-pressed', 'true')
    expect(optionItem.querySelector('svg')).toBeInTheDocument()
  })

  it('selected가 아니면 체크 아이콘을 렌더링하지 않습니다', () => {
    render(<OptionItem>버튼</OptionItem>)

    expect(
      screen.getByRole('button', { name: '버튼' }).querySelector('svg'),
    ).not.toBeInTheDocument()
  })

  it('disabled 상태에서는 클릭 핸들러를 호출하지 않고 비활성 스타일을 적용합니다', () => {
    const handleClick = vi.fn()

    render(
      <OptionItem disabled onClick={handleClick} selected>
        버튼
      </OptionItem>,
    )

    const optionItem = screen.getByRole('button', { name: '버튼' })

    expect(optionItem).toBeDisabled()
    expect(optionItem).toHaveClass('disabled:text-warm-gray-300')

    fireEvent.click(optionItem)

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('Figma 기준 높이와 typography 스타일을 적용합니다', () => {
    render(<OptionItem>버튼</OptionItem>)

    const optionItem = screen.getByRole('button', { name: '버튼' })

    expect(optionItem).toHaveClass('h-9', 'py-2.5', 'text-cool-gray-900')
    expect(screen.getByText('버튼')).toHaveClass('typo-body-3')
  })
})
