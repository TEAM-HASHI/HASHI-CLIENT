import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PopularRestaurantsPage } from './PopularRestaurantsPage'

const LocationPath = () => {
  const location = useLocation()

  return <div data-testid="location-path">{location.pathname}</div>
}

const renderPopularRestaurantsPage = () => {
  return render(
    <MemoryRouter initialEntries={['/restaurants/popular']}>
      <Routes>
        <Route
          element={<PopularRestaurantsPage />}
          path="/restaurants/popular"
        />
        <Route element={<LocationPath />} path="/restaurants/:restaurantId" />
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
