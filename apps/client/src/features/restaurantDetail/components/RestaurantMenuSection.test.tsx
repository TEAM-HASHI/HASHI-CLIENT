import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { RestaurantMenuSection } from '@/features/restaurantDetail/components/RestaurantMenuSection'

describe('RestaurantMenuSection', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders empty state when menus are empty', () => {
    render(<RestaurantMenuSection menus={[]} onPressMenuItem={vi.fn()} />)

    expect(screen.getByText('메뉴 리스트를 준비중이에요.')).toBeInTheDocument()
  })
})
