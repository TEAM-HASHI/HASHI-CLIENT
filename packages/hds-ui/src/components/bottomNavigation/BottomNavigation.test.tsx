import '@testing-library/jest-dom/vitest'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { BottomNavigation, type BottomNavigationItem } from './BottomNavigation'

const items = [
  { value: 'home', label: '홈', icon: <span data-testid="home-icon" /> },
  { value: 'save', label: '저장', icon: <span data-testid="save-icon" /> },
  { value: 'map', label: '지도', icon: <span data-testid="map-icon" /> },
] satisfies BottomNavigationItem[]

afterEach(() => {
  cleanup()
})

describe('BottomNavigation', () => {
  it('renders every item label', () => {
    render(<BottomNavigation items={items} value="home" />)

    expect(screen.getByRole('button', { name: '홈' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '지도' })).toBeInTheDocument()
  })

  it('marks the active item as the current page', () => {
    render(<BottomNavigation items={items} value="save" />)

    expect(screen.getByRole('button', { name: '저장' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('button', { name: '홈' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('renders without a current page when value is not provided', () => {
    render(<BottomNavigation items={items} />)

    expect(screen.getByRole('button', { name: '홈' })).not.toHaveAttribute(
      'aria-current',
    )
    expect(screen.getByRole('button', { name: '저장' })).not.toHaveAttribute(
      'aria-current',
    )
    expect(screen.getByRole('button', { name: '지도' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('calls onValueChange when an inactive item is clicked', () => {
    const handleValueChange = vi.fn()

    render(
      <BottomNavigation
        items={items}
        onValueChange={handleValueChange}
        value="home"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    expect(handleValueChange).toHaveBeenCalledTimes(1)
    expect(handleValueChange).toHaveBeenCalledWith('save')
  })

  it('does not call onValueChange when the active item is clicked again', () => {
    const handleValueChange = vi.fn()

    render(
      <BottomNavigation
        items={items}
        onValueChange={handleValueChange}
        value="home"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '홈' }))

    expect(handleValueChange).not.toHaveBeenCalled()
  })
})
