import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RestaurantMenuDetailPage } from '@/pages/restaurantMenuDetail/RestaurantMenuDetailPage'

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}))
const { mockParams } = vi.hoisted(() => ({
  mockParams: {
    menuId: 'shio-ramen-1',
    restaurantId: 'default',
  },
}))
const { mockLocationStore } = vi.hoisted(() => ({
  mockLocationStore: {
    state: undefined as { source?: 'today' | 'detail' } | undefined,
  },
}))
const { mockAuthStore } = vi.hoisted(() => ({
  mockAuthStore: {
    isAuthenticated: false,
  },
}))
const { mockScrollTo } = vi.hoisted(() => ({
  mockScrollTo: vi.fn(),
}))
const { mockClipboardWriteText } = vi.hoisted(() => ({
  mockClipboardWriteText: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useLocation: () => ({ state: mockLocationStore.state }),
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  }
})

vi.mock('@/shared/hooks', () => ({
  useAuthStatus: () => ({
    isAuthenticated: mockAuthStore.isAuthenticated,
    status: mockAuthStore.isAuthenticated ? 'authenticated' : 'unauthenticated',
  }),
}))

describe('RestaurantMenuDetailPage', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: mockClipboardWriteText,
      },
    })
    vi.stubGlobal('scrollTo', mockScrollTo)
  })

  afterEach(() => {
    cleanup()
    mockNavigate.mockClear()
    mockClipboardWriteText.mockClear()
    mockScrollTo.mockClear()
    mockParams.menuId = 'shio-ramen-1'
    mockParams.restaurantId = 'default'
    mockLocationStore.state = undefined
    mockAuthStore.isAuthenticated = false
    vi.unstubAllGlobals()
  })

  it('renders selected menu detail and other menus', () => {
    render(<RestaurantMenuDetailPage />)

    expect(screen.getByTestId('restaurant-menu-detail-page')).toHaveClass(
      'pb-[calc(82px+var(--safe-area-bottom,0px))]',
    )
    expect(screen.queryByRole('main')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '시오라멘' })).toBeTruthy()
    expect(screen.getByText('다른 메뉴')).toBeTruthy()
    expect(screen.getByText('9')).toBeTruthy()
    expect(screen.getAllByText('대표')).toHaveLength(2)
    expect(screen.getByRole('button', { name: '예약하기' })).toBeTruthy()
    expect(
      screen.queryByRole('button', { name: '다시 추천 받기' }),
    ).not.toBeInTheDocument()
  })

  it('navigates to another menu detail when another menu is pressed', () => {
    render(<RestaurantMenuDetailPage />)

    fireEvent.click(screen.getAllByRole('button', { name: /시오라멘/ })[0])

    expect(mockNavigate).toHaveBeenCalledWith(
      '/restaurants/default/menus/shio-ramen-2',
    )
  })

  it('keeps source state when moving to another menu detail', () => {
    mockLocationStore.state = { source: 'today' }

    render(<RestaurantMenuDetailPage />)

    fireEvent.click(screen.getAllByRole('button', { name: /시오라멘/ })[0])

    expect(mockNavigate).toHaveBeenCalledWith(
      '/restaurants/default/menus/shio-ramen-2',
      { state: { source: 'today' } },
    )
  })

  it('keeps representative badges when a representative menu is selected', () => {
    mockParams.menuId = 'shio-ramen-2'

    render(<RestaurantMenuDetailPage />)

    expect(screen.getAllByText('대표')).toHaveLength(2)
  })

  it('resets scroll position on menu detail entry', () => {
    render(<RestaurantMenuDetailPage />)

    expect(mockScrollTo).toHaveBeenCalledWith({ top: 0 })
  })

  it('copies the current page link when share is pressed', () => {
    render(<RestaurantMenuDetailPage />)

    fireEvent.click(screen.getByRole('button', { name: '공유하기' }))

    expect(mockClipboardWriteText).toHaveBeenCalledWith(
      `${window.location.origin}/restaurants/default/menus/shio-ramen-1`,
    )
  })

  it('replaces invalid menu id with the first valid menu path', () => {
    mockParams.menuId = 'unknown'

    render(<RestaurantMenuDetailPage />)

    expect(mockNavigate).toHaveBeenCalledWith(
      '/restaurants/default/menus/shio-ramen-1',
      { replace: true, state: undefined },
    )
  })

  it('moves to restaurant detail review tab from detail menu flow', () => {
    mockLocationStore.state = { source: 'detail' }

    render(<RestaurantMenuDetailPage />)

    fireEvent.click(screen.getByRole('tab', { name: /리뷰/ }))

    expect(mockNavigate).toHaveBeenCalledWith('/restaurants/default', {
      state: { activeTab: 'review' },
    })
  })

  it('moves to today restaurant review tab from today menu flow', () => {
    mockLocationStore.state = { source: 'today' }

    render(<RestaurantMenuDetailPage />)

    fireEvent.click(screen.getByRole('tab', { name: /리뷰/ }))

    expect(mockNavigate).toHaveBeenCalledWith('/restaurants/today', {
      state: { activeTab: 'review' },
    })
  })

  it('renders menu image fallback with default image component', () => {
    const { container } = render(<RestaurantMenuDetailPage />)

    expect(
      container.querySelector('img[src^="data:image/svg+xml"]'),
    ).toBeTruthy()
  })

  it('opens login bottom sheet for unauthenticated reservation action', () => {
    render(<RestaurantMenuDetailPage />)

    fireEvent.click(screen.getByRole('button', { name: '예약하기' }))

    expect(screen.getByRole('dialog', { name: '로그인 안내' })).toBeTruthy()
  })

  it('navigates to reservation page for authenticated reservation action', () => {
    mockAuthStore.isAuthenticated = true

    render(<RestaurantMenuDetailPage />)

    fireEvent.click(screen.getByRole('button', { name: '예약하기' }))

    expect(mockNavigate).toHaveBeenCalledWith(
      '/restaurants/default/reservations/new',
    )
  })

  it('opens login bottom sheet for unauthenticated like action', () => {
    render(<RestaurantMenuDetailPage />)

    fireEvent.click(screen.getByRole('button', { name: '좋아요' }))

    expect(screen.getByRole('dialog', { name: '로그인 안내' })).toBeTruthy()
    expect(
      screen.queryByRole('heading', { name: '서비스를 준비하고 있어요.' }),
    ).not.toBeInTheDocument()
  })

  it('opens coming soon dialog for authenticated like action', () => {
    mockAuthStore.isAuthenticated = true

    render(<RestaurantMenuDetailPage />)

    fireEvent.click(screen.getByRole('button', { name: '좋아요' }))

    expect(
      screen.getByRole('heading', { name: '서비스를 준비하고 있어요.' }),
    ).toBeTruthy()
  })
})
