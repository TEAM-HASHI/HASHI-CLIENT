import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MapRestaurantMarker } from '@/pages/map/components/MapRestaurantMarker'

afterEach(cleanup)

describe('MapRestaurantMarker', () => {
  it.each(['restaurant', 'cafe', 'bar'] as const)(
    'selects a %s marker by keyboard and reflects selection',
    async (category) => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      const restaurant = {
        id: 'custom-place',
        name: '테스트 식당',
        category,
        rating: 4.7,
      }
      const { rerender } = render(
        <MapRestaurantMarker
          restaurant={restaurant}
          isSelected={false}
          onSelect={onSelect}
        />,
      )
      const button = screen.getByRole('button', {
        name: '테스트 식당 지도 마커',
      })
      expect(button).toHaveAttribute('aria-pressed', 'false')
      expect(screen.queryByText('4.7')).not.toBeInTheDocument()
      button.focus()
      await user.keyboard('{Enter}')
      expect(onSelect).toHaveBeenCalledExactlyOnceWith('custom-place')
      rerender(
        <MapRestaurantMarker
          restaurant={restaurant}
          isSelected
          onSelect={onSelect}
        />,
      )
      expect(button).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByText('4.7')).toBeVisible()
    },
  )
})
