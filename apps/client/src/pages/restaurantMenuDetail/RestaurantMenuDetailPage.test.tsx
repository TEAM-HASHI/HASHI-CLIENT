import '@testing-library/jest-dom/vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getRestaurantMenu } from '@/features/restaurantDetail/api/getRestaurantMenu'
import { getRestaurantMenus } from '@/features/restaurantDetail/api/getRestaurantMenus'
import { getRestaurantSummary } from '@/features/restaurantDetail/api/getRestaurantSummary'
import { RestaurantMenuDetailPage } from '@/pages/restaurantMenuDetail/RestaurantMenuDetailPage'
import { mockIntersectionObserver } from '@/test/mockIntersectionObserver'

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}))
const { mockStartKakaoOAuth } = vi.hoisted(() => ({
  mockStartKakaoOAuth: vi.fn(),
}))
const { mockParams } = vi.hoisted(() => ({
  mockParams: {
    menuId: '100',
    restaurantId: '10',
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
    useLocation: () => ({
      hash: '',
      pathname: `/restaurants/${mockParams.restaurantId}/menus/${mockParams.menuId}`,
      search: '',
      state: mockLocationStore.state,
    }),
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  }
})

vi.mock('@/shared/hooks', async () => {
  const actual =
    await vi.importActual<typeof import('@/shared/hooks')>('@/shared/hooks')

  return {
    ...actual,
    useAuthStatus: () => ({
      isAuthenticated: mockAuthStore.isAuthenticated,
      status: mockAuthStore.isAuthenticated
        ? 'authenticated'
        : 'unauthenticated',
    }),
  }
})

vi.mock('@/features/auth/hooks/useKakaoOAuthStart', () => ({
  useKakaoOAuthStart: () => ({
    startKakaoOAuth: mockStartKakaoOAuth,
  }),
}))

vi.mock('@/features/restaurantDetail/api/getRestaurantMenu', () => ({
  getRestaurantMenu: vi.fn(),
}))
vi.mock('@/features/restaurantDetail/api/getRestaurantMenus', () => ({
  getRestaurantMenus: vi.fn(),
}))
vi.mock('@/features/restaurantDetail/api/getRestaurantSummary', () => ({
  getRestaurantSummary: vi.fn(),
}))

const mockedGetRestaurantMenu = vi.mocked(getRestaurantMenu)
const mockedGetRestaurantMenus = vi.mocked(getRestaurantMenus)
const mockedGetRestaurantSummary = vi.mocked(getRestaurantSummary)

const restaurantSummary = {
  restaurantId: 10,
  name: '하시 스시',
  address: '도쿄도 주오구 긴자 1-1',
  imageUrls: ['https://example.com/restaurant.webp'],
  reservationFee: 4_000,
  reviewCount: 2,
}

const selectedMenu = {
  menuId: 100,
  name: '시오라멘',
  description: '담백한 소금 라멘',
  imageUrl: 'https://example.com/shio.webp',
  currency: 'JPY',
  price: 1_000,
  main: true,
  otherMenuCount: 2,
}

const restaurantMenus = {
  menus: [
    {
      menuId: 101,
      name: '쇼유라멘',
      description: '진한 간장 라멘',
      imageUrl: 'https://example.com/shoyu.webp',
      currency: 'JPY',
      price: 1_100,
      main: true,
    },
    {
      menuId: 102,
      name: '미소라멘',
      description: '구수한 된장 라멘',
      imageUrl: 'https://example.com/miso.webp',
      currency: 'JPY',
      price: 1_200,
      main: false,
    },
  ],
  nextCursor: undefined,
  hasNext: false,
}

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <RestaurantMenuDetailPage />
    </QueryClientProvider>,
  )
}

describe('RestaurantMenuDetailPage', () => {
  beforeEach(() => {
    mockParams.menuId = '100'
    mockParams.restaurantId = '10'
    mockedGetRestaurantSummary.mockResolvedValue(restaurantSummary)
    mockedGetRestaurantMenu.mockResolvedValue(selectedMenu)
    mockedGetRestaurantMenus.mockResolvedValue(restaurantMenus)
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
    mockedGetRestaurantSummary.mockReset()
    mockedGetRestaurantMenu.mockReset()
    mockedGetRestaurantMenus.mockReset()
    mockParams.menuId = '100'
    mockParams.restaurantId = '10'
    mockLocationStore.state = undefined
    mockAuthStore.isAuthenticated = false
    vi.unstubAllGlobals()
  })

  it('requests menu detail with route params', async () => {
    renderPage()

    await waitFor(() => {
      expect(mockedGetRestaurantMenu).toHaveBeenCalledWith({
        restaurantId: 10,
        menuId: 100,
      })
    })
  })

  it('requests other menus excluding selected menu', async () => {
    renderPage()

    await waitFor(() => {
      expect(mockedGetRestaurantMenus).toHaveBeenCalledWith({
        restaurantId: 10,
        excludeMenuId: 100,
        cursor: undefined,
        size: 10,
      })
    })
  })

  it('renders selected menu detail and other menus', async () => {
    renderPage()

    expect(
      await screen.findByTestId('restaurant-menu-detail-page'),
    ).toHaveClass('pb-[calc(82px+var(--safe-area-bottom,0px))]')
    expect(
      screen.getByTestId('restaurant-menu-detail-fixed-header'),
    ).toHaveClass('fixed', 'top-0', 'max-w-[var(--app-mobile-max-width,100%)]')
    expect(
      screen
        .getByTestId('restaurant-menu-detail-fixed-header')
        .querySelector('header'),
    ).toHaveClass('h-[75px]')
    expect(
      screen.getByTestId('restaurant-menu-detail-tab-fixed-container'),
    ).toHaveClass('fixed', 'max-w-[var(--app-mobile-max-width,100%)]')
    expect(
      screen.getByTestId('restaurant-menu-detail-tab-fixed-container'),
    ).toHaveStyle({ top: '75px' })
    expect(
      screen.getByTestId('restaurant-menu-detail-fixed-spacer'),
    ).toHaveStyle({ height: '125px' })
    expect(screen.getByText('하시 스시')).toHaveClass(
      'truncate',
      'whitespace-nowrap',
    )
    expect(screen.queryByRole('main')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '시오라멘' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: '다른 메뉴 2' })).toBeTruthy()
    expect(screen.getAllByText('대표')).toHaveLength(1)
    expect(screen.getByRole('button', { name: '예약하기' })).toBeTruthy()
    expect(
      screen.queryByRole('button', { name: '다시 추천 받기' }),
    ).not.toBeInTheDocument()
  })

  it('loads the next other menu page when the bottom sentinel enters the viewport', async () => {
    const { observe, triggerIntersect } = mockIntersectionObserver()

    mockedGetRestaurantMenus
      .mockResolvedValueOnce({
        ...restaurantMenus,
        nextCursor: 102,
        hasNext: true,
      })
      .mockResolvedValueOnce({
        menus: [
          {
            menuId: 103,
            name: '탄탄멘',
            description: '매콤한 탄탄멘',
            imageUrl: 'https://example.com/tantan.webp',
            currency: 'JPY',
            price: 1_300,
            main: false,
          },
        ],
        nextCursor: undefined,
        hasNext: false,
      })

    renderPage()

    const loadMore = await screen.findByTestId('restaurant-menu-load-more')

    await waitFor(() => {
      expect(observe).toHaveBeenCalledWith(loadMore)
    })

    triggerIntersect()

    await waitFor(() => {
      expect(mockedGetRestaurantMenus).toHaveBeenCalledWith({
        restaurantId: 10,
        excludeMenuId: 100,
        cursor: 102,
        size: 10,
      })
    })
    expect(await screen.findByRole('button', { name: /탄탄멘/ })).toBeTruthy()
  })

  it('navigates to another menu detail when another menu is pressed', async () => {
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: /쇼유라멘/ }))

    expect(mockNavigate).toHaveBeenCalledWith('/restaurants/10/menus/101')
  })

  it('keeps source state when moving to another menu detail', async () => {
    mockLocationStore.state = { source: 'today' }

    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: /쇼유라멘/ }))

    expect(mockNavigate).toHaveBeenCalledWith('/restaurants/10/menus/101', {
      state: { source: 'today' },
    })
  })

  it('keeps representative badges when a representative menu is selected', async () => {
    mockParams.menuId = '101'
    mockedGetRestaurantMenu.mockResolvedValue({
      ...restaurantMenus.menus[0],
      otherMenuCount: 2,
    })

    renderPage()

    expect(
      await screen.findByRole('heading', { name: '쇼유라멘' }),
    ).toBeTruthy()
    expect(screen.getAllByText('대표')).toHaveLength(1)
  })

  it('resets scroll position on menu detail entry', () => {
    renderPage()

    expect(mockScrollTo).toHaveBeenCalledWith({ top: 0 })
  })

  it('copies the current page link when share is pressed', async () => {
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: '공유하기' }))

    expect(mockClipboardWriteText).toHaveBeenCalledWith(
      `${window.location.origin}/restaurants/10/menus/100`,
    )
  })

  it('shows not found page for invalid menu id', () => {
    mockParams.menuId = 'unknown'

    renderPage()

    expect(screen.getByRole('heading', { name: '404 페이지' })).toBeTruthy()
  })

  it('moves to restaurant detail review tab from detail menu flow', async () => {
    mockLocationStore.state = { source: 'detail' }

    renderPage()

    fireEvent.click(await screen.findByRole('tab', { name: /리뷰/ }))

    expect(mockNavigate).toHaveBeenCalledWith('/restaurants/10', {
      state: { activeTab: 'review' },
    })
  })

  it('moves to today restaurant review tab from today menu flow', async () => {
    mockLocationStore.state = { source: 'today' }

    renderPage()

    fireEvent.click(await screen.findByRole('tab', { name: /리뷰/ }))

    expect(mockNavigate).toHaveBeenCalledWith('/restaurants/today', {
      state: { activeTab: 'review' },
    })
  })

  it('renders menu image fallback with default image component', async () => {
    mockedGetRestaurantMenu.mockResolvedValue({
      ...selectedMenu,
      imageUrl: undefined,
    })

    renderPage()

    expect(
      await screen.findByTestId('restaurant-menu-detail-default-image'),
    ).toBeTruthy()
  })

  it('opens login bottom sheet for unauthenticated reservation action', async () => {
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: '예약하기' }))

    expect(screen.getByRole('dialog', { name: '로그인 안내' })).toBeTruthy()
  })

  it('starts Kakao OAuth from the login bottom sheet with the menu path', async () => {
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: '예약하기' }))
    fireEvent.click(
      screen.getByRole('button', { name: '카카오로 1초 만에 시작하기' }),
    )

    expect(mockStartKakaoOAuth).toHaveBeenCalledWith(
      '/restaurants/10/menus/100',
    )
  })

  it('navigates to reservation page for authenticated reservation action', async () => {
    mockAuthStore.isAuthenticated = true

    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: '예약하기' }))

    expect(mockNavigate).toHaveBeenCalledWith(
      '/restaurants/10/reservations/new',
    )
  })

  it('opens login bottom sheet for unauthenticated like action', async () => {
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: '좋아요' }))

    expect(screen.getByRole('dialog', { name: '로그인 안내' })).toBeTruthy()
    expect(
      screen.queryByRole('heading', { name: '서비스를 준비하고 있어요.' }),
    ).not.toBeInTheDocument()
  })

  it('opens coming soon dialog for authenticated like action', async () => {
    mockAuthStore.isAuthenticated = true

    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: '좋아요' }))

    expect(
      screen.getByRole('heading', { name: '서비스를 준비하고 있어요.' }),
    ).toBeTruthy()
  })
})
