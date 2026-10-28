import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'

import { MapSaveAction } from '@/pages/map/components/MapSaveAction'
import type { MapRestaurant } from '@/pages/map/types'

const restaurant: MapRestaurant = {
  id: '10',
  name: '식당',
  areaCode: 'ueno',
  category: 'restaurant',
  cuisine: '일식',
  rating: 4,
  reviewCount: 0,
  recommendationRank: 1,
  menuKeywords: [],
  images: [],
  hours: '',
  price: '',
  description: '',
  address: '',
  position: { lat: 35.7, lng: 139.7 },
}
afterEach(cleanup)

it('does not invent a zero or crash when save count is unknown', () => {
  render(<MapSaveAction restaurant={restaurant} onSave={() => {}} />)
  expect(screen.getByRole('button', { name: '식당 저장' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
  expect(screen.queryByLabelText(/저장 수/)).not.toBeInTheDocument()
})

it('shows the provided count and saved state without performing a write', async () => {
  const onSave = vi.fn()
  render(
    <MapSaveAction
      restaurant={{ ...restaurant, saveCount: 1200, saved: true }}
      onSave={onSave}
    />,
  )
  expect(screen.getByLabelText('저장 수 1200')).toHaveTextContent('1,200')
  const button = screen.getByRole('button', { name: '식당 저장' })
  expect(button).toHaveAttribute('aria-pressed', 'true')
  await userEvent.setup().click(button)
  expect(onSave).toHaveBeenCalledTimes(1)
  expect(button).toHaveAttribute('aria-pressed', 'true')
})
