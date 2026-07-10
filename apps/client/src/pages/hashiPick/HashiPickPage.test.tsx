import '@testing-library/jest-dom/vitest'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'
import { HashiPickPage } from '@/pages/hashiPick/HashiPickPage'

const LocationPath = () => {
  const location = useLocation()

  return <div data-testid="location-path">{location.pathname}</div>
}

const renderHashiPickPage = () => {
  return render(
    <MemoryRouter initialEntries={[ROUTES.hashiPickRestaurants]}>
      <Routes>
        <Route element={<HashiPickPage />} path={ROUTES.hashiPickRestaurants} />
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

describe('HashiPickPage', () => {
  afterEach(() => {
    cleanup()
    document.body.style.overflow = ''
    vi.unstubAllGlobals()
  })

  it('renders title, filters, and restaurant cards', () => {
    renderHashiPickPage()

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
      screen.getByRole('heading', { name: '하시 Pick' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '정렬 필터: 기본순' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '음식 장르 필터: 음식 장르 선택' }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: /히마와리 스시/ }),
    ).toHaveLength(10)
  })

  it('keeps selected sort unchanged until apply is pressed', () => {
    renderHashiPickPage()

    fireEvent.click(screen.getByRole('button', { name: '정렬 필터: 기본순' }))
    fireEvent.click(screen.getByRole('button', { name: '인기순' }))
    fireEvent.click(screen.getByRole('button', { name: '닫기' }))

    expect(
      screen.getByRole('button', { name: '정렬 필터: 기본순' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: '정렬 필터: 인기순' }),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '정렬 필터: 기본순' }))
    fireEvent.click(screen.getByRole('button', { name: '별점순' }))
    fireEvent.click(screen.getByRole('button', { name: '적용' }))

    expect(
      screen.getByRole('button', { name: '정렬 필터: 별점순' }),
    ).toBeInTheDocument()
  })

  it('resets category to default and closes the bottom sheet when reset is pressed', () => {
    renderHashiPickPage()

    fireEvent.click(
      screen.getByRole('button', { name: '음식 장르 필터: 음식 장르 선택' }),
    )
    fireEvent.click(screen.getByRole('button', { name: '면류' }))
    fireEvent.click(screen.getByRole('button', { name: '초기화' }))

    expect(
      screen.getByRole('button', {
        name: '음식 장르 필터: 음식 장르 선택',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: '음식 장르 선택' })).toHaveClass(
      'animate-bottom-sheet-panel-out',
    )
  })

  it('navigates to restaurant detail when a card is pressed', () => {
    renderHashiPickPage()

    fireEvent.click(screen.getAllByRole('button', { name: /히마와리 스시/ })[0])

    expect(screen.getByTestId('location-path')).toHaveTextContent(
      '/restaurants/1',
    )
  })

  it('navigates to home when the header back button is pressed', () => {
    renderHashiPickPage()

    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))

    expect(screen.getByTestId('location-path')).toHaveTextContent(ROUTES.home)
  })

  it('renders five fallback image slots that follow the parent content width', () => {
    renderHashiPickPage()
    const imageList = screen.getAllByTestId('restaurant-image-list')[0]

    expect(screen.queryAllByRole('img')).toHaveLength(0)
    expect(imageList).toHaveClass('w-full', 'overflow-x-auto')
    expect(imageList).not.toHaveClass('max-w-[353px]')
    expect(
      within(imageList).getAllByTestId('restaurant-image-placeholder'),
    ).toHaveLength(5)
  })

  it('loads restaurants in 10 item chunks when the bottom sentinel enters the viewport', () => {
    const { triggerIntersect } = mockIntersectionObserver()

    renderHashiPickPage()

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
