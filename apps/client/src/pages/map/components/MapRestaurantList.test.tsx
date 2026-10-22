import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { afterEach, expect, it, vi } from 'vitest'
import { MapRestaurantList } from '@/pages/map/components/MapRestaurantList'
import { mockIntersectionObserver } from '@/test/mockIntersectionObserver'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
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
it('shows only the loading indicator, without a title or sort controls during a fresh query', () => {
  render(<MapRestaurantList {...props} status="loading" />)
  expect(screen.getByRole('status')).toHaveTextContent(
    '식당 목록을 불러오고 있어요.',
  )
  expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})
it('loads the next page at the visible list bottom, but stops on failure or exhaustion', () => {
  const observer = mockIntersectionObserver()
  const load = vi.fn()
  const view = render(
    <MapRestaurantList {...props} nextCursor="next" onLoadNext={load} />,
  )
  observer.triggerIntersect()
  expect(load).toHaveBeenCalledOnce()
  expect(
    screen.queryByRole('button', { name: '더 보기' }),
  ).not.toBeInTheDocument()
  view.rerender(
    <MapRestaurantList
      {...props}
      nextCursor="next"
      nextError
      onLoadNext={load}
    />,
  )
  observer.triggerAllIntersects()
  expect(load).toHaveBeenCalledOnce()
  view.rerender(<MapRestaurantList {...props} onLoadNext={load} />)
  observer.triggerAllIntersects()
  expect(load).toHaveBeenCalledOnce()
})
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
it('allows retry for retained results after a failed refresh even without a next cursor', async () => {
  const retry = vi.fn()
  const view = render(
    <MapRestaurantList {...props} nextError onLoadNext={retry} retryDisabled />,
  )
  const button = screen.getByRole('button', { name: '다시 시도하기' })
  expect(button).toBeDisabled()
  await userEvent.click(button)
  expect(retry).not.toHaveBeenCalled()
  view.rerender(<MapRestaurantList {...props} nextError onLoadNext={retry} />)
  await userEvent.click(button)
  expect(retry).toHaveBeenCalledOnce()
})
it.each([{ active: false }, { loadingNext: true }])(
  'does not automatically load a hidden or pending list: %s',
  (state) => {
    const observer = mockIntersectionObserver()
    const load = vi.fn()
    const view = render(
      <MapRestaurantList
        {...props}
        {...state}
        nextCursor="next"
        onLoadNext={load}
      />,
    )
    observer.triggerAllIntersects()
    expect(load).not.toHaveBeenCalled()
    view.rerender(
      <MapRestaurantList
        {...props}
        active
        loadingNext={false}
        nextCursor="next"
        onLoadNext={load}
      />,
    )
    observer.triggerIntersect()
    expect(load).toHaveBeenCalledOnce()
  },
)
it('shows no empty-state body, heading or reset action', () => {
  render(<MapRestaurantList {...props} />)
  expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  expect(
    screen.queryByText('조건에 맞는 맛집이 없어요.'),
  ).not.toBeInTheDocument()
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
