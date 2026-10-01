import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { RestaurantDetailTabs } from '@/features/restaurantDetail/components/RestaurantDetailTabs'

afterEach(cleanup)

describe('restaurant photo tab count', () => {
  it('shows a supplied total including zero', () => {
    render(
      <RestaurantDetailTabs
        activeTab="photo"
        reviewCount={12}
        photoCount={0}
        onTabChange={vi.fn()}
      />,
    )
    expect(screen.getByRole('tab', { name: /사진/ })).toHaveTextContent('0')
  })

  it('does not fabricate a count when the photo source is not connected', () => {
    render(
      <RestaurantDetailTabs
        activeTab="info"
        reviewCount={12}
        onTabChange={vi.fn()}
      />,
    )
    expect(screen.getByRole('tab', { name: /사진/ })).toHaveTextContent(
      /^사진$/,
    )
  })
})
