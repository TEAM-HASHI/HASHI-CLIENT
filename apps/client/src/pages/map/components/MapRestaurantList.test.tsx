import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { MapRestaurantList } from '@/pages/map/components/MapRestaurantList'

afterEach(cleanup)
const props = {
  restaurants: [],
  sort: 'recommended' as const,
  filtered: true,
  sortTriggerRef: createRef<HTMLButtonElement>(),
  onSortChange: vi.fn(),
  onSelect: vi.fn(),
  onSave: vi.fn(),
  onReset: vi.fn(),
}
it('shows the full error illustration and retries a failed next page', async () => {
  const retry = vi.fn()
  render(
    <MapRestaurantList
      {...props}
      nextCursor="next"
      nextError
      onLoadNext={retry}
    />,
  )
  expect(screen.getByRole('alert')).toHaveTextContent(
    '식당 목록을 불러오지 못했어요!',
  )
  expect(screen.getByRole('alert').querySelector('img')).not.toBeNull()
  await userEvent.click(screen.getByRole('button', { name: '다시 시도하기' }))
  expect(retry).toHaveBeenCalledOnce()
})
it('shows no invented empty-state heading or reset action', () => {
  render(<MapRestaurantList {...props} />)
  expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})
it('shows the error message and retries a failed initial request', async () => {
  const retry = vi.fn()
  render(<MapRestaurantList {...props} status="error" onRetry={retry} />)
  expect(screen.getByRole('alert')).toHaveTextContent(
    '식당 목록을 불러오지 못했어요!',
  )
  expect(screen.getByRole('alert').querySelector('img')).not.toBeNull()
  expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: '다시 시도하기' }))
  expect(retry).toHaveBeenCalledOnce()
})
