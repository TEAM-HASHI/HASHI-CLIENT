import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, expect, it, vi } from 'vitest'
import { getRestaurantSummary } from '@/features/restaurantDetail/api/getRestaurantSummary'
import {
  getRecentRestaurants,
  saveRecentRestaurant,
} from '@/features/recentRestaurants/recentRestaurants'
import { RecentRestaurants } from '@/pages/search/components/RecentRestaurants'
import { HttpStatusError } from '@/shared/api/apiError'

vi.mock('@/features/restaurantDetail/api/getRestaurantSummary', () => ({
  getRestaurantSummary: vi.fn(),
}))

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.resetAllMocks()
})

it('removes only confirmed missing restaurants and clears restaurant history independently of search keywords', async () => {
  saveRecentRestaurant({ id: 1, name: '삭제된 식당' })
  saveRecentRestaurant({ id: 2, name: '일시 오류 식당' })
  localStorage.setItem('hashi:search:recent-keywords', JSON.stringify(['라멘']))
  vi.mocked(getRestaurantSummary).mockImplementation(async (id) => {
    throw new HttpStatusError(id === 1 ? 404 : 500)
  })
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <RecentRestaurants />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  await waitFor(() =>
    expect(getRecentRestaurants().map(({ id }) => id)).toEqual([2]),
  )
  expect(
    screen.getByRole('button', { name: '일시 오류 식당' }),
  ).toBeInTheDocument()
  fireEvent.click(
    screen.getByRole('button', { name: '최근 본 맛집 전체 삭제' }),
  )
  expect(getRecentRestaurants()).toEqual([])
  expect(
    screen.queryByRole('heading', { name: '최근 본 맛집' }),
  ).not.toBeInTheDocument()
  expect(localStorage.getItem('hashi:search:recent-keywords')).toBe(
    JSON.stringify(['라멘']),
  )
})

it('shows summary image and category and opens the selected restaurant', async () => {
  saveRecentRestaurant({ id: 3, name: '스시 하루' })
  vi.mocked(getRestaurantSummary).mockResolvedValue({
    restaurantId: 3,
    name: '스시 하루',
    address: '일본 도쿄도 주오구',
    foodCategory: '스시',
    thumbnailUrl: 'https://example.com/sushi.jpg',
    imageUrls: [],
    reservationFee: 0,
  })
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<RecentRestaurants />} />
          <Route path="/restaurants/3" element={<p>식당 상세 화면</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
  expect(await screen.findByText('스시')).toBeInTheDocument()
  expect(screen.getByTitle('일본 도쿄도 주오구')).toHaveTextContent(
    '일본 도쿄도 주오구',
  )
  const card = screen.getByRole('button', { name: '스시 하루' })
  expect(card.querySelector('img')).toHaveAttribute(
    'src',
    'https://example.com/sushi.jpg',
  )
  fireEvent.click(card)
  expect(screen.getByText('식당 상세 화면')).toBeInTheDocument()
  client.clear()
})
