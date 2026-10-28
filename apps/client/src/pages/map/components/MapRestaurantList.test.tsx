import { render, screen, cleanup, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { MapRestaurantList } from '@/pages/map/components/MapRestaurantList'
import { mockIntersectionObserver } from '@/test/mockIntersectionObserver'
import { mapFixtureRestaurants } from '@/pages/map/__tests__/mapApiFixtures'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
const props = {
  restaurants: [],
  filtered: true,
  onSelect: vi.fn(),
  onSave: vi.fn(),
}
it('shows restaurant card skeletons instead of a spinner during a fresh query', () => {
  render(<MapRestaurantList {...props} status="loading" />)
  const loading = screen.getByRole('status', { name: '식당 목록 로딩 중' })
  expect(loading.querySelectorAll('article')).toHaveLength(3)
  expect(loading.querySelector('img')).toBeNull()
  expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})
it('keeps loaded cards and adds a skeleton while the next page is pending', () => {
  render(
    <MapRestaurantList
      {...props}
      restaurants={[mapFixtureRestaurants[0]]}
      nextCursor="next"
      loadingNext
    />,
  )
  expect(
    screen.getByRole('button', {
      name: `${mapFixtureRestaurants[0].name} 상세 보기`,
    }),
  ).toBeVisible()
  const loading = screen.getByRole('status', { name: '식당 목록 로딩 중' })
  expect(loading.querySelectorAll('article')).toHaveLength(1)
  expect(within(loading).queryByRole('button')).not.toBeInTheDocument()
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
