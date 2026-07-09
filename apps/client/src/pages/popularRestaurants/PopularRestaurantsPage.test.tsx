import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'
import { PopularRestaurantsPage } from '@/pages/popularRestaurants/PopularRestaurantsPage'

const LocationPath = () => {
  const location = useLocation()

  return <div data-testid="location-path">{location.pathname}</div>
}

const renderPopularRestaurantsPage = () => {
  return render(
    <MemoryRouter initialEntries={[ROUTES.popularRestaurants]}>
      <Routes>
        <Route
          element={<PopularRestaurantsPage />}
          path={ROUTES.popularRestaurants}
        />
        <Route element={<LocationPath />} path={ROUTES.restaurantDetail} />
        <Route element={<LocationPath />} path={ROUTES.home} />
      </Routes>
    </MemoryRouter>,
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
  afterEach(() => {
    cleanup()
    document.body.style.overflow = ''
    vi.unstubAllGlobals()
  })

  it('renders popular restaurant list with default and rating sort options', () => {
    renderPopularRestaurantsPage()

    expect(screen.getByTestId('restaurant-list-sticky-header')).toHaveClass(
      'app-mobile-fixed-top',
      'z-fixed',
      'bg-white',
    )
    expect(screen.getByTestId('restaurant-list-scroll-content')).toHaveClass(
      'pt-[75px]',
    )
    expect(screen.getByTestId('restaurant-list')).not.toHaveClass('pt-[123px]')
    expect(
      screen.getByRole('heading', { name: '인기 맛집' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '정렬 필터: 기본순' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '정렬 필터: 기본순' }))

    expect(screen.getByRole('button', { name: '별점순' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: '인기순' }),
    ).not.toBeInTheDocument()
  })

  it('navigates to home when the header back button is pressed', () => {
    renderPopularRestaurantsPage()

    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))

    expect(screen.getByTestId('location-path')).toHaveTextContent(ROUTES.home)
  })

  it('loads restaurants in 10 item chunks when the bottom sentinel enters the viewport', () => {
    const { triggerIntersect } = mockIntersectionObserver()

    renderPopularRestaurantsPage()

    expect(
      screen.getAllByRole('button', { name: /히마와리 스시/ }),
    ).toHaveLength(10)

    triggerIntersect()

    expect(
      screen.getAllByRole('button', { name: /히마와리 스시/ }),
    ).toHaveLength(20)

    triggerIntersect()

    expect(
      screen.getAllByRole('button', { name: /히마와리 스시/ }),
    ).toHaveLength(25)
  })
})
