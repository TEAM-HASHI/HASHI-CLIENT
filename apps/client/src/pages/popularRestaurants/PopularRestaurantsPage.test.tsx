import '@testing-library/jest-dom/vitest'
import { QueryClientProvider } from '@tanstack/react-query'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'
import { getRestaurants } from '@/features/restaurantList'
import { PopularRestaurantsPage } from '@/pages/popularRestaurants/PopularRestaurantsPage'
import { createQueryClient } from '@/shared/lib/queryClient'

vi.mock('@/features/restaurantList/api/getRestaurants', () => ({
  getRestaurants: vi.fn(),
}))

const mockedGetRestaurants = vi.mocked(getRestaurants)

const LocationPath = () => {
  const location = useLocation()

  return <div data-testid="location-path">{location.pathname}</div>
}

const createRestaurantsResult = ({
  count,
  hasNext = false,
  imageUrls = [],
  nextCursor,
  rating = 4,
  startId = 1,
}: {
  count: number
  hasNext?: boolean
  imageUrls?: string[]
  nextCursor?: string
  rating?: number
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
        imageUrls,
        name: `히마와리 스시 ${restaurantId}`,
        rating,
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
          <Route element={<LocationPath />} path={ROUTES.restaurantDetail} />
          <Route element={<LocationPath />} path={ROUTES.home} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

const mockIntersectionObserver = () => {
  let triggerIntersect = () => {}

  const IntersectionObserverMock = vi.fn(
    (callback: IntersectionObserverCallback) => {
      triggerIntersect = () => {
        callback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver,
        )
      }

      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
        root: null,
        rootMargin: '',
        thresholds: [],
        takeRecords: vi.fn(() => []),
      }
    },
  )

  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

  return {
    triggerIntersect: () => {
      act(() => {
        triggerIntersect()
      })
    },
  }
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

  it('renders popular restaurant list with default and rating sort options', async () => {
    renderPopularRestaurantsPage()

    expect(screen.getByTestId('restaurant-list-sticky-header')).toHaveClass(
      'app-mobile-fixed-top',
      'z-fixed',
      'bg-white',
    )
    expect(screen.getByTestId('restaurant-list-scroll-content')).toHaveClass(
      'pt-[75px]',
    )
    expect(
      screen.getByRole('heading', { name: '인기 맛집' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '정렬 필터: 기본순' }),
    ).toBeInTheDocument()
    expect(
      await screen.findAllByRole('button', { name: /히마와리 스시/ }),
    ).toHaveLength(3)
    expect(screen.getAllByText('4.0')).toHaveLength(3)
    expect(mockedGetRestaurants).toHaveBeenCalledWith({
      genre: 'all',
      size: 10,
      sort: 'basic',
      type: 'popular',
    })

    fireEvent.click(screen.getByRole('button', { name: '정렬 필터: 기본순' }))

    expect(screen.getByRole('button', { name: '별점순' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: '인기순' }),
    ).not.toBeInTheDocument()
  })

  it('applies rating sort to popular restaurants request params', async () => {
    renderPopularRestaurantsPage()
    await screen.findByRole('button', { name: /히마와리 스시 1/ })

    fireEvent.click(screen.getByRole('button', { name: '정렬 필터: 기본순' }))
    fireEvent.click(screen.getByRole('button', { name: '별점순' }))
    fireEvent.click(screen.getByRole('button', { name: '적용' }))

    expect(
      screen.getByRole('button', { name: '정렬 필터: 별점순' }),
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(mockedGetRestaurants).toHaveBeenLastCalledWith({
        genre: 'all',
        size: 10,
        sort: 'rating',
        type: 'popular',
      })
    })
  })

  it('navigates to home when the header back button is pressed', () => {
    renderPopularRestaurantsPage()

    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))

    expect(screen.getByTestId('location-path')).toHaveTextContent(ROUTES.home)
  })

  it('resets sort to default and closes the bottom sheet when reset is pressed', async () => {
    renderPopularRestaurantsPage()
    await screen.findByRole('button', { name: /히마와리 스시 1/ })

    fireEvent.click(screen.getByRole('button', { name: '정렬 필터: 기본순' }))
    fireEvent.click(screen.getByRole('button', { name: '별점순' }))
    fireEvent.click(screen.getByRole('button', { name: '적용' }))
    await screen.findByRole('button', { name: '정렬 필터: 별점순' })

    fireEvent.click(screen.getByRole('button', { name: '정렬 필터: 별점순' }))
    fireEvent.click(screen.getByRole('button', { name: '초기화' }))

    expect(
      screen.getByRole('button', { name: '정렬 필터: 기본순' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: '정렬 순서' })).toHaveClass(
      'animate-bottom-sheet-panel-out',
    )
  })

  it('fetches next page when the bottom sentinel enters the viewport', async () => {
    mockedGetRestaurants
      .mockResolvedValueOnce(
        createRestaurantsResult({
          count: 10,
          hasNext: true,
          nextCursor: 'c-10',
        }),
      )
      .mockResolvedValueOnce(createRestaurantsResult({ count: 2, startId: 11 }))
    const { triggerIntersect } = mockIntersectionObserver()

    renderPopularRestaurantsPage()

    expect(
      await screen.findAllByRole('button', { name: /히마와리 스시/ }),
    ).toHaveLength(10)
    await screen.findByTestId('restaurant-list-load-more')

    triggerIntersect()

    await waitFor(() => {
      expect(mockedGetRestaurants).toHaveBeenLastCalledWith({
        cursor: 'c-10',
        genre: 'all',
        size: 10,
        sort: 'basic',
        type: 'popular',
      })
    })
    expect(
      await screen.findAllByRole('button', { name: /히마와리 스시/ }),
    ).toHaveLength(12)
  })

  it('renders only image urls returned by the server', async () => {
    mockedGetRestaurants.mockResolvedValueOnce(
      createRestaurantsResult({
        count: 1,
        imageUrls: [
          'https://example.com/restaurant-1.jpg',
          'https://example.com/restaurant-2.jpg',
        ],
      }),
    )

    renderPopularRestaurantsPage()
    await screen.findByRole('button', { name: /히마와리 스시 1/ })

    expect(screen.getAllByRole('img')).toHaveLength(2)
    expect(screen.queryByTestId('restaurant-image-placeholder')).toBeNull()
  })

  it('renders one default image when no image is returned by the server', async () => {
    mockedGetRestaurants.mockResolvedValueOnce(
      createRestaurantsResult({
        count: 1,
        imageUrls: [],
      }),
    )

    renderPopularRestaurantsPage()
    await screen.findByRole('button', { name: /히마와리 스시 1/ })

    expect(screen.queryAllByRole('img')).toHaveLength(0)
    expect(screen.getAllByTestId('restaurant-image-placeholder')).toHaveLength(
      1,
    )
  })
})
