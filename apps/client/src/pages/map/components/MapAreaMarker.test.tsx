import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'

import { MapAreaMarker } from '@/pages/map/components/MapAreaMarker'

afterEach(cleanup)

it('shows an injected empty area and passes its code on selection', async () => {
  const user = userEvent.setup()
  const onSelect = vi.fn()
  render(
    <MapAreaMarker
      area={{
        code: 'custom',
        name: '새 지역',
        position: { lat: 0, lng: 0 },
        restaurantCount: 0,
      }}
      onSelect={onSelect}
    />,
  )
  expect(screen.getByText('0')).toBeVisible()
  await user.click(screen.getByRole('button', { name: '새 지역 식당 보기' }))
  expect(onSelect).toHaveBeenCalledExactlyOnceWith('custom')
})
