import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'

import { MapViewButton } from '@/pages/map/components/MapViewButton'

afterEach(cleanup)

it('allows returning to the map only while enabled', async () => {
  const user = userEvent.setup()
  const onClick = vi.fn()
  const { rerender } = render(<MapViewButton onClick={onClick} />)
  const button = screen.getByRole('button', { name: '지도로 보기' })
  await user.click(button)
  expect(onClick).toHaveBeenCalledTimes(1)
  rerender(<MapViewButton onClick={onClick} disabled />)
  expect(button).toBeDisabled()
  await user.click(button)
  expect(onClick).toHaveBeenCalledTimes(1)
})
