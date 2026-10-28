import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'

import { mapFixtureRestaurants } from '@/pages/map/__tests__/mapApiFixtures'
import { MapRestaurantCard } from '@/pages/map/components/MapRestaurantCard'

afterEach(cleanup)

it('selects from metadata, whitespace, title and photos while keeping save independent', async () => {
  const user = userEvent.setup()
  const onSelect = vi.fn()
  const onSave = vi.fn()
  const restaurant = mapFixtureRestaurants[0]
  render(
    <MapRestaurantCard
      restaurant={restaurant}
      onSelect={onSelect}
      onSave={onSave}
    />,
  )
  await user.click(screen.getByText(`도쿄 · ${restaurant.cuisine}`))
  await user.click(screen.getByRole('article'))
  await user.click(
    screen.getByRole('button', { name: `${restaurant.name} 상세 보기` }),
  )
  await user.click(
    screen.getByRole('button', { name: `${restaurant.name} 사진 1 보기` }),
  )
  expect(onSelect).toHaveBeenCalledTimes(4)
  await user.click(
    screen.getByRole('button', { name: `${restaurant.name} 저장` }),
  )
  expect(onSave).toHaveBeenCalledOnce()
  expect(onSelect).toHaveBeenCalledTimes(4)
})
