import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { RestaurantMenuListSection } from '@/features/restaurantDetail/components/RestaurantMenuListSection'

describe('RestaurantMenuListSection', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders empty state when menus are empty', () => {
    render(<RestaurantMenuListSection menus={[]} onPressMenuItem={vi.fn()} />)

    expect(screen.getByText('메뉴 리스트를 준비중이에요.')).toBeInTheDocument()
  })
})
