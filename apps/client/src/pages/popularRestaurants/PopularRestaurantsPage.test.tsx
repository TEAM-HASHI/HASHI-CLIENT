import '@testing-library/jest-dom/vitest'
import { QueryClientProvider } from '@tanstack/react-query'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'
import { getRestaurants } from '@/features/restaurantList'
import { PopularRestaurantsPage } from '@/pages/popularRestaurants/PopularRestaurantsPage'
import { createQueryClient } from '@/shared/lib/queryClient'

vi.mock('@/features/restaurantList/api/getRestaurants', () => ({
  getRestaurants: vi.fn(),
}))

const mockedGetRestaurants = vi.mocked(getRestaurants)

const createRestaurantsResult = ({
  count,
  hasNext = false,
  nextCursor,
  startId = 1,
}: {
  count: number
  hasNext?: boolean
  nextCursor?: string
  startId?: number
}): Awaited<ReturnType<typeof getRestaurants>> => {
  return {
    hasNext,
    nextCursor,
    restaurants: Array.from({ length: count }, (_, index) => {
      const restaurantId = startId + index

      return {
        area: '도쿄',
        foodCategory: '초밥',
        hashtags: ['해시태그'],
        imageUrls: [],
        name: `히마와리 스시 ${restaurantId}`,
        rating: 4,
        restaurantId,
        summary: '식당 소개를 여기 간단하게 한 줄 적어주세요.',
      }
    }),
  }
}

const renderPopularRestaurantsPage = () => {
  const queryClient = createQueryClient()

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[ROUTES.popularRestaurants]}>
        <Routes>
          <Route
            element={<PopularRestaurantsPage />}
            path={ROUTES.popularRestaurants}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('PopularRestaurantsPage', () => {
  beforeEach(() => {
    mockedGetRestaurants.mockResolvedValue(
      createRestaurantsResult({ count: 3 }),
    )
  })

  afterEach(() => {
    cleanup()
    document.body.style.overflow = ''
    mockedGetRestaurants.mockReset()
    vi.unstubAllGlobals()
  })

  it('resets only the draft sort and keeps the bottom sheet open until apply is pressed', async () => {
    renderPopularRestaurantsPage()
    await screen.findByRole('button', { name: /히마와리 스시 1/ })

    fireEvent.click(screen.getByRole('button', { name: '정렬 필터: 기본순' }))
    fireEvent.click(screen.getByRole('button', { name: '별점순' }))
    fireEvent.click(screen.getByRole('button', { name: '적용' }))
    await screen.findByRole('button', { name: '정렬 필터: 별점순' })

    fireEvent.click(screen.getByRole('button', { name: '정렬 필터: 별점순' }))
    fireEvent.click(screen.getByRole('button', { name: '초기화' }))

    expect(
      screen.getByRole('dialog', { name: '정렬 순서' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '정렬 필터: 별점순' }),
    ).toBeInTheDocument()
    expect(mockedGetRestaurants).toHaveBeenCalledTimes(2)

    fireEvent.click(screen.getByRole('button', { name: '적용' }))

    expect(
      screen.getByRole('button', { name: '정렬 필터: 기본순' }),
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(mockedGetRestaurants).toHaveBeenLastCalledWith({
        genre: 'all',
        size: 10,
        sort: 'basic',
        type: 'popular',
      })
    })
  })
})
