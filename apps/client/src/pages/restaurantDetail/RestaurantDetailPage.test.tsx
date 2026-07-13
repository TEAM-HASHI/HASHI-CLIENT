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

import { getRestaurantMenus } from '@/features/restaurantDetail/api/getRestaurantMenus'
import { getRestaurantReviews } from '@/features/restaurantDetail/api/getRestaurantReviews'
import { getRestaurantStoreInformation } from '@/features/restaurantDetail/api/getRestaurantStoreInformation'
import { getRestaurantSummary } from '@/features/restaurantDetail/api/getRestaurantSummary'
import { RestaurantDetailPage } from '@/pages/restaurantDetail/RestaurantDetailPage'

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}))
const { mockStartKakaoOAuth } = vi.hoisted(() => ({
  mockStartKakaoOAuth: vi.fn(),
}))
const { mockLocationStore } = vi.hoisted(() => ({
  mockLocationStore: {
    state: undefined as { activeTab?: string } | undefined,
  },
}))
const { mockParams } = vi.hoisted(() => ({
  mockParams: {
    restaurantId: '10',
  },
}))
const { mockAuthStore } = vi.hoisted(() => ({
  mockAuthStore: {
    isAuthenticated: false,
  },
}))
const { mockRequestAnimationFrame, mockScrollTo } = vi.hoisted(() => ({
  mockRequestAnimationFrame: vi.fn((callback: FrameRequestCallback) => {
    callback(0)
    return 0
  }),
  mockScrollTo: vi.fn(),
}))
const { mockClipboardWriteText, mockShowToast, mockToastQueueClear } =
  vi.hoisted(() => ({
    mockClipboardWriteText: vi.fn(),
    mockShowToast: vi.fn(),
    mockToastQueueClear: vi.fn(),
  }))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useLocation: () => ({
      hash: '',
      pathname: '/restaurants/default',
      search: '',
      state: mockLocationStore.state,
    }),
    useNavigate: () => mockNavigate,
    useParams: () => ({ restaurantId: mockParams.restaurantId }),
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

vi.mock('@hashi/hds-ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hashi/hds-ui')>()

  return {
    ...actual,
    showToast: mockShowToast,
    toastQueue: {
      ...actual.toastQueue,
      clear: mockToastQueueClear,
    },
  }
})

vi.mock('@/features/restaurantDetail/api/getRestaurantSummary', () => ({
  getRestaurantSummary: vi.fn(),
}))
vi.mock(
  '@/features/restaurantDetail/api/getRestaurantStoreInformation',
  () => ({
    getRestaurantStoreInformation: vi.fn(),
  }),
)
vi.mock('@/features/restaurantDetail/api/getRestaurantMenus', () => ({
  getRestaurantMenus: vi.fn(),
}))
vi.mock('@/features/restaurantDetail/api/getRestaurantReviews', () => ({
  getRestaurantReviews: vi.fn(),
}))

const mockedGetRestaurantSummary = vi.mocked(getRestaurantSummary)
const mockedGetRestaurantStoreInformation = vi.mocked(
  getRestaurantStoreInformation,
)
const mockedGetRestaurantMenus = vi.mocked(getRestaurantMenus)
const mockedGetRestaurantReviews = vi.mocked(getRestaurantReviews)

const restaurantSummary = {
  restaurantId: 10,
  name: '하시 스시',
  localName: 'HASHI SUSHI',
  rating: 4.7,
  reviewCount: 2,
  summary: '긴자에서 즐기는 오마카세',
  foodCategory: 'SUSHI',
  address: '도쿄도 주오구 긴자 1-1',
  thumbnailUrl: 'https://example.com/thumbnail.webp',
  imageUrls: ['https://example.com/restaurant.webp'],
  reservationFee: 4_000,
}

const restaurantStoreInformation = {
  restaurantId: 10,
  description: '긴자역 인근 스시 전문점입니다.',
  businessHours: [
    {
      dayOfWeek: 'MONDAY',
      openTime: '11:00',
      closeTime: '20:00',
      breakStart: undefined,
      breakEnd: undefined,
      closed: false,
    },
  ],
  priceRange: {
    currency: 'JPY',
    minPrice: 1_000,
    maxPrice: 3_000,
  },
}

const restaurantMenus = {
  menus: [
    {
      menuId: 100,
      name: '시오라멘',
      description: '담백한 소금 라멘',
      imageUrl: 'https://example.com/menu.webp',
      currency: 'JPY',
      price: 1_000,
      representative: true,
    },
  ],
  nextCursor: undefined,
  hasNext: false,
}

const restaurantReviews = {
  restaurantId: 10,
  averageRating: 4.5,
  reviewCount: 1,
  reviews: [
    {
      reviewId: 200,
      writerNickname: '하시유저',
      rating: 5,
      content: '정말 맛있습니다.',
      keywords: ['친절해요'],
      previewImageUrls: ['https://example.com/review.webp'],
      imageCount: 1,
      createdAt: '2026-07-01T12:00:00',
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
      <RestaurantDetailPage />
    </QueryClientProvider>,
  )
}

describe('RestaurantDetailPage', () => {
  beforeEach(() => {
    mockedGetRestaurantSummary.mockResolvedValue(restaurantSummary)
    mockedGetRestaurantStoreInformation.mockResolvedValue(
      restaurantStoreInformation,
    )
    mockedGetRestaurantMenus.mockResolvedValue(restaurantMenus)
    mockedGetRestaurantReviews.mockResolvedValue(restaurantReviews)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: mockClipboardWriteText,
      },
    })
    vi.stubGlobal('requestAnimationFrame', mockRequestAnimationFrame)
    vi.stubGlobal('scrollTo', mockScrollTo)
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn(() => ({
        disconnect: vi.fn(),
        observe: vi.fn(),
        takeRecords: () => [],
        unobserve: vi.fn(),
      })),
    )
  })

  afterEach(() => {
    cleanup()
    mockedGetRestaurantSummary.mockReset()
    mockedGetRestaurantStoreInformation.mockReset()
    mockedGetRestaurantMenus.mockReset()
    mockedGetRestaurantReviews.mockReset()
    mockNavigate.mockClear()
    mockClipboardWriteText.mockClear()
    mockShowToast.mockClear()
    mockToastQueueClear.mockClear()
    mockRequestAnimationFrame.mockClear()
    mockScrollTo.mockClear()
    mockLocationStore.state = undefined
    mockParams.restaurantId = '10'
    mockAuthStore.isAuthenticated = false
    vi.unstubAllGlobals()
  })

  it('renders restaurant detail from API responses without recommend again action', async () => {
    renderPage()

    expect(await screen.findByRole('main')).toHaveClass(
      'pb-[calc(82px+var(--safe-area-bottom,0px))]',
    )
    expect(screen.getByRole('heading', { name: '식당 상세 정보' })).toBeTruthy()
    expect(screen.getByText('하시 스시')).toBeInTheDocument()
    expect(screen.getByText('HASHI SUSHI')).toBeInTheDocument()
    expect(screen.getByText('예약금 4,000원')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '매장 정보' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(
      screen.queryByRole('button', { name: '다시 추천 받기' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '예약하기' })).toBeTruthy()
  })

  it('renders default image when restaurant hero image fails to load', async () => {
    const { container } = renderPage()

    await screen.findByRole('main')

    expect(
      screen.queryByTestId('restaurant-detail-hero-default-image'),
    ).not.toBeInTheDocument()

    const heroImage = container.querySelector(
      '[aria-label="식당 이미지 1"] img',
    )
    expect(heroImage).toBeInTheDocument()

    fireEvent.error(heroImage as HTMLImageElement)

    expect(
      screen.getByTestId('restaurant-detail-hero-default-image'),
    ).toBeInTheDocument()
  })

  it('renders one default hero image when restaurant has no images', async () => {
    mockedGetRestaurantSummary.mockResolvedValue({
      ...restaurantSummary,
      imageUrls: [],
    })

    renderPage()

    await screen.findByRole('main')

    expect(screen.getAllByLabelText(/식당 이미지 \d+/)).toHaveLength(1)
    expect(
      screen.getByTestId('restaurant-detail-hero-default-image'),
    ).toBeInTheDocument()
  })

  it('renders default image when menu image fails to load', async () => {
    renderPage()

    fireEvent.click(await screen.findByRole('tab', { name: '메뉴' }))

    expect(screen.queryByTestId('restaurant-menu-default-image')).toBeNull()

    const menuImage = screen
      .getByRole('button', { name: /시오라멘/ })
      .querySelector('img')
    expect(menuImage).toBeInTheDocument()

    fireEvent.error(menuImage as HTMLImageElement)

    expect(
      screen.getByTestId('restaurant-menu-default-image'),
    ).toBeInTheDocument()
  })

  it('keeps restaurant detail visible and renders menu error state when menu request fails', async () => {
    mockedGetRestaurantMenus.mockRejectedValue(new Error('menu error'))

    renderPage()

    expect(await screen.findByText('하시 스시')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: '메뉴' }))

    expect(
      screen.getByText('메뉴 정보를 불러오지 못했어요.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '메뉴 다시 불러오기' }),
    ).toBeTruthy()
  })

  it('renders review content and opens review image viewer', async () => {
    renderPage()

    fireEvent.click(await screen.findByRole('tab', { name: /리뷰/ }))

    expect(screen.getByText('하시유저')).toBeInTheDocument()
    expect(screen.getByText('정말 맛있습니다.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '리뷰 이미지 1' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '최신순' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    fireEvent.click(screen.getByRole('button', { name: /리뷰 이미지/ }))

    expect(
      screen.getByRole('dialog', { name: '리뷰 이미지 상세보기' }),
    ).toBeTruthy()
    expect(
      screen
        .getAllByTestId('review-image-viewer-image')[0]
        .querySelector('img'),
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: '리뷰 이미지 상세보기 닫기' }),
    )

    expect(
      screen.queryByRole('dialog', { name: '리뷰 이미지 상세보기' }),
    ).not.toBeInTheDocument()
  })

  it('refetches reviews with selected sort option', async () => {
    renderPage()

    await screen.findByRole('main')
    expect(mockedGetRestaurantReviews).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: 'latest',
      }),
    )

    mockedGetRestaurantReviews.mockClear()
    fireEvent.click(screen.getByRole('tab', { name: /리뷰/ }))
    fireEvent.click(screen.getByRole('button', { name: '높은 평점 순' }))

    await waitFor(() => {
      expect(mockedGetRestaurantReviews).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: 'rating-high',
        }),
      )
    })

    mockedGetRestaurantReviews.mockClear()
    fireEvent.click(await screen.findByRole('button', { name: '낮은 평점 순' }))

    await waitFor(() => {
      expect(mockedGetRestaurantReviews).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: 'rating-low',
        }),
      )
    })
  })

  it('keeps the page visible and renders review list skeleton while review sort is loading', async () => {
    renderPage()

    fireEvent.click(await screen.findByRole('tab', { name: /리뷰/ }))
    expect(screen.getByText('하시유저')).toBeInTheDocument()

    mockedGetRestaurantReviews.mockReturnValue(
      new Promise<typeof restaurantReviews>(() => {
        // Keep the review sort request pending to assert the in-section skeleton.
      }),
    )
    fireEvent.click(screen.getByRole('button', { name: '높은 평점 순' }))

    await waitFor(() => {
      expect(mockedGetRestaurantReviews).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: 'rating-high',
        }),
      )
    })
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '낮은 평점 순' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('status', { name: '리뷰 목록 로딩 중' }),
    ).toBeTruthy()
    expect(screen.queryByText('로딩 중이에요')).not.toBeInTheDocument()
  })

  it('navigates to menu detail when a menu item is pressed', async () => {
    renderPage()

    fireEvent.click(await screen.findByRole('tab', { name: '메뉴' }))
    fireEvent.click(screen.getByRole('button', { name: /시오라멘/ }))

    expect(mockNavigate).toHaveBeenCalledWith('/restaurants/10/menus/100', {
      state: { source: 'detail' },
    })
  })

  it('uses route state to select the initial active tab', async () => {
    mockLocationStore.state = { activeTab: 'review' }

    renderPage()

    expect(await screen.findByRole('tab', { name: /리뷰/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('opens login bottom sheet for unauthenticated reservation action', async () => {
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: '예약하기' }))

    expect(screen.getByRole('dialog', { name: '로그인 안내' })).toBeTruthy()
    expect(mockNavigate).not.toHaveBeenCalledWith(
      '/restaurants/10/reservations/new',
    )
  })

  it('starts Kakao OAuth from the login bottom sheet with the detail path', async () => {
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: '예약하기' }))
    fireEvent.click(
      screen.getByRole('button', { name: '카카오로 1초 만에 시작하기' }),
    )

    expect(mockStartKakaoOAuth).toHaveBeenCalledWith('/restaurants/default')
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

  it('smoothly scrolls to the tab position for menu or review and to the top for info', async () => {
    renderPage()

    fireEvent.click(await screen.findByRole('tab', { name: '메뉴' }))
    fireEvent.click(screen.getByRole('tab', { name: /리뷰/ }))
    fireEvent.click(screen.getByRole('tab', { name: '매장 정보' }))

    expect(mockScrollTo).toHaveBeenCalledTimes(3)
    expect(mockScrollTo).toHaveBeenNthCalledWith(1, {
      top: expect.any(Number),
      behavior: 'smooth',
    })
    expect(mockScrollTo).toHaveBeenNthCalledWith(2, {
      top: expect.any(Number),
      behavior: 'smooth',
    })
    expect(mockScrollTo).toHaveBeenNthCalledWith(3, {
      top: 0,
      behavior: 'smooth',
    })
  })

  it('copies the current page link when share is pressed', async () => {
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: '공유하기' }))

    expect(mockClipboardWriteText).toHaveBeenCalledWith(
      `${window.location.origin}/restaurants/10`,
    )
  })

  it('copies the restaurant name and shows a toast when name copy is pressed', async () => {
    renderPage()

    fireEvent.click(await screen.findByRole('button', { name: '식당명 복사' }))

    expect(mockClipboardWriteText).toHaveBeenCalledWith('하시 스시')
    await waitFor(() => {
      expect(mockToastQueueClear).toHaveBeenCalled()
      expect(mockShowToast).toHaveBeenCalledWith({
        children: '식당명이 복사되었어요',
      })
    })
  })

  it('renders not found page without requesting API when restaurant id is invalid', async () => {
    mockParams.restaurantId = 'default'

    renderPage()

    expect(
      await screen.findByRole('heading', { name: '404 페이지' }),
    ).toBeTruthy()
    expect(mockedGetRestaurantSummary).not.toHaveBeenCalled()
  })
})
