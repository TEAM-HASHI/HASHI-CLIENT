import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Tabs } from './Tabs'

const items = [
  { value: 'write', label: '리뷰 쓰기', count: 1 },
  { value: 'written', label: '작성한 리뷰', count: 4 },
  { value: 'menu', label: '메뉴' },
]

afterEach(() => {
  cleanup()
})

describe('Tabs', () => {
  it('renders labels and optional counts', () => {
    render(<Tabs items={items} value="write" onChange={() => undefined} />)

    expect(screen.getByText('리뷰 쓰기')).toBeInTheDocument()
    expect(screen.getByText('작성한 리뷰')).toBeInTheDocument()
    expect(screen.getByText('메뉴')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('calls onChange with the clicked item value', () => {
    const handleChange = vi.fn()

    render(<Tabs items={items} value="write" onChange={handleChange} />)

    fireEvent.click(screen.getByRole('tab', { name: '작성한 리뷰 4' }))

    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith('written')
  })

  it('does not call onChange when clicking the selected item', () => {
    const handleChange = vi.fn()

    render(<Tabs items={items} value="write" onChange={handleChange} />)

    fireEvent.click(screen.getByRole('tab', { name: '리뷰 쓰기 1' }))

    expect(handleChange).not.toHaveBeenCalled()
  })

  it('applies selected styles to the active item', () => {
    render(<Tabs items={items} value="written" onChange={() => undefined} />)

    expect(screen.getByText('작성한 리뷰')).toHaveClass(
      'typo-sub-header-2',
      'text-primary-200',
    )
    expect(screen.getByText('리뷰 쓰기')).toHaveClass(
      'typo-body-4',
      'text-warm-gray-300',
    )
  })

  it('moves the active indicator to the selected tab', () => {
    render(<Tabs items={items} value="written" onChange={() => undefined} />)

    expect(document.querySelector('[data-hds-tabs-indicator]')).toHaveClass(
      'transition-transform',
      'motion-reduce:transition-none',
    )
    expect(document.querySelector('[data-hds-tabs-indicator]')).toHaveStyle({
      width: `${100 / items.length}%`,
      transform: 'translateX(100%)',
    })
  })

  it('exposes the selected tab state for assistive technologies', () => {
    render(<Tabs items={items} value="written" onChange={() => undefined} />)

    expect(screen.getByRole('tablist')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '작성한 리뷰 4' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: '리뷰 쓰기 1' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })
})
