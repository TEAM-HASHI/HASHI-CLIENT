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
import { getRandomRestaurantRecommendation } from '@/features/restaurantDetail/api/getRandomRestaurantRecommendation'
import { getRestaurantReviews } from '@/features/restaurantDetail/api/getRestaurantReviews'
import { getRestaurantStoreInformation } from '@/features/restaurantDetail/api/getRestaurantStoreInformation'
import { getVisitedReservations } from '@/features/review/api/getVisitedReservations'
import { TodayRestaurantPage } from '@/pages/todayRestaurant/TodayRestaurantPage'

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
const { mockAuthStore } = vi.hoisted(() => ({
  mockAuthStore: {
    isAuthenticated: false,
  },
}))
const { mockClipboardWriteText, mockShowToast, mockToastQueueClear } =
  vi.hoisted(() => ({
    mockClipboardWriteText: vi.fn(),
    mockShowToast: vi.fn(),
    mockToastQueueClear: vi.fn(),
  }))
const { mockExecCommand } = vi.hoisted(() => ({
  mockExecCommand: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useLocation: () => ({
      hash: '',
      pathname: '/restaurants/today',
      search: '',
      state: mockLocationStore.state,
    }),
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/shared/hooks', () => ({
  useAuthStatus: () => ({
    isAuthenticated: mockAuthStore.isAuthenticated,
    status: mockAuthStore.isAuthenticated ? 'authenticated' : 'unauthenticated',
  }),
  useInfiniteScrollTrigger: () => vi.fn(),
}))

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

vi.mock(
  '@/features/restaurantDetail/api/getRandomRestaurantRecommendation',
  () => ({
    getRandomRestaurantRecommendation: vi.fn(),
  }),
)
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
vi.mock('@/features/review/api/getVisitedReservations', () => ({
  getVisitedReservations: vi.fn(),
}))

const mockedGetRandomRestaurantRecommendation = vi.mocked(
  getRandomRestaurantRecommendation,
)
const mockedGetRestaurantStoreInformation = vi.mocked(
  getRestaurantStoreInformation,
)
const mockedGetRestaurantMenus = vi.mocked(getRestaurantMenus)
const mockedGetRestaurantReviews = vi.mocked(getRestaurantReviews)
const mockedGetVisitedReservations = vi.mocked(getVisitedReservations)

const todayRestaurantSummary = {
  restaurantId: 10,
  name: '야키니쿠 리키마루 이케부쿠로 히가시구치 텐',
  localName: '焼肉力丸 池袋東口店',
  rating: 3.8,
  reviewCount: 1,
  summary: '오사카 이케부쿠로에서 사랑받는 무제한 야키니쿠를 즐기세요.',
  foodCategory: 'YAKINIKU',
  address: '도쿄도 도시마구 남이케부쿠로 1-22-2',
  thumbnailUrl: 'https://example.com/today-thumbnail.webp',
  imageUrls: ['https://example.com/today-restaurant.webp'],
  reservationFee: 4_000,
}

const nextRestaurantSummary = {
  ...todayRestaurantSummary,
  restaurantId: 11,
  name: '하시 라멘',
  localName: 'HASHI RAMEN',
}

const restaurantStoreInformation = {
  restaurantId: 10,
  description: '오늘 추천된 식당입니다.',
  businessHours: [
    {
      dayOfWeek: 'MONDAY',
      openTime: '10:00',
      closeTime: '22:00',
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
    {
      menuId: 101,
      name: '미소라멘',
      description: '진한 미소 라멘',
      imageUrl: 'https://example.com/menu-2.webp',
      currency: 'JPY',
      price: 1_200,
      representative: false,
    },
  ],
  nextCursor: undefined,
  hasNext: false,
}

const restaurantReviews = {
  restaurantId: 10,
  averageRating: 3.8,
  reviewCount: 1,
  reviews: [
    {
      reviewId: 200,
      writerNickname: '하시유저',
      rating: 4,
      content: '다시 가고 싶은 식당입니다.',
      keywords: ['음식이 빨리 나와요'],
      previewImageUrls: ['https://example.com/review.webp'],
      imageCount: 1,
      createdAt: '2026-07-01T12:00:00',
    },
  ],
  nextCursor: undefined,
  hasNext: false,
}

const renderTodayRestaurantPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <TodayRestaurantPage />
    </QueryClientProvider>,
  )
}

describe('TodayRestaurantPage', () => {
  beforeEach(() => {
    mockedGetRandomRestaurantRecommendation.mockResolvedValue(
      todayRestaurantSummary,
    )
    mockedGetRestaurantStoreInformation.mockResolvedValue(
      restaurantStoreInformation,
    )
    mockedGetRestaurantMenus.mockResolvedValue(restaurantMenus)
    mockedGetRestaurantReviews.mockResolvedValue(restaurantReviews)
    mockedGetVisitedReservations.mockResolvedValue({
      content: [],
      hasNext: false,
      totalCount: 0,
    })
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: mockClipboardWriteText,
      },
    })
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: mockExecCommand,
    })
  })

  afterEach(() => {
    cleanup()
    mockedGetRandomRestaurantRecommendation.mockReset()
    mockedGetRestaurantStoreInformation.mockReset()
    mockedGetRestaurantMenus.mockReset()
    mockedGetRestaurantReviews.mockReset()
    mockedGetVisitedReservations.mockReset()
    mockNavigate.mockClear()
    mockClipboardWriteText.mockReset()
    mockShowToast.mockReset()
    mockToastQueueClear.mockReset()
    mockExecCommand.mockReset()
    mockLocationStore.state = undefined
    mockAuthStore.isAuthenticated = false
  })

  it('renders today restaurant detail with recommend again action', async () => {
    const getBoundingClientRectSpy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({
        bottom: 126,
        height: 50,
        left: 0,
        right: 393,
        top: 76,
        width: 393,
        x: 0,
        y: 76,
        toJSON: () => ({}),
      })

    renderTodayRestaurantPage()

    expect(
      await screen.findByTestId('restaurant-detail-fixed-header'),
    ).toHaveClass('fixed', 'top-0')
    expect(
      screen.getByTestId('restaurant-detail-tab-sticky-container'),
    ).toHaveAttribute('data-fixed', 'false')
    expect(screen.getByRole('heading', { name: '오늘의 식당' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: '매장 정보' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('button', { name: '다시 추천 받기' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '예약하기' })).toBeTruthy()

    getBoundingClientRectSpy.mockReturnValue({
      bottom: 125,
      height: 50,
      left: 0,
      right: 393,
      top: 75,
      width: 393,
      x: 0,
      y: 75,
      toJSON: () => ({}),
    })
    fireEvent.scroll(window)

    await waitFor(() => {
      expect(
        screen.getByTestId('restaurant-detail-tab-sticky-container'),
      ).toHaveAttribute('data-fixed', 'true')
    })
    getBoundingClientRectSpy.mockRestore()
  })

  it('switches tabs and opens the review unavailable modal from review CTA', async () => {
    mockAuthStore.isAuthenticated = true

    renderTodayRestaurantPage()

    fireEvent.click(await screen.findByRole('tab', { name: '메뉴' }))

    expect(screen.getByRole('tab', { name: '메뉴' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getAllByText('시오라멘')[0]).toBeTruthy()

    fireEvent.click(screen.getAllByRole('button', { name: /시오라멘/ })[0])

    expect(mockNavigate).toHaveBeenCalledWith('/restaurants/10/menus/100', {
      state: { source: 'today' },
    })

    fireEvent.click(screen.getByRole('tab', { name: /리뷰/ }))
    fireEvent.click(screen.getByRole('button', { name: '리뷰 작성하기' }))

    expect(
      await screen.findByRole('heading', {
        name: '실제 방문자만 작성할 수 있어요',
      }),
    ).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: '확인' }))

    expect(
      screen.queryByRole('heading', { name: '실제 방문자만 작성할 수 있어요' }),
    ).not.toBeInTheDocument()
  })

  it('opens login bottom sheet for unauthenticated review write action', async () => {
    renderTodayRestaurantPage()

    fireEvent.click(await screen.findByRole('tab', { name: /리뷰/ }))
    fireEvent.click(screen.getByRole('button', { name: '리뷰 작성하기' }))

    expect(screen.getByRole('dialog', { name: '로그인 안내' })).toBeTruthy()
    expect(mockedGetVisitedReservations).not.toHaveBeenCalled()
  })

  it('navigates to review writing page when a writable visited reservation exists', async () => {
    mockAuthStore.isAuthenticated = true
    mockedGetVisitedReservations.mockResolvedValue({
      content: [
        {
          reservationId: 23,
          restaurantId: 10,
          reviewable: true,
        },
      ],
      hasNext: false,
      totalCount: 1,
    })

    renderTodayRestaurantPage()

    fireEvent.click(await screen.findByRole('tab', { name: /리뷰/ }))
    fireEvent.click(screen.getByRole('button', { name: '리뷰 작성하기' }))

    await waitFor(() => {
      expect(mockedGetVisitedReservations).toHaveBeenCalledWith({
        restaurantId: 10,
        reviewStatus: 'unreviewed',
        size: 1,
      })
      expect(mockNavigate).toHaveBeenCalledWith(
        '/restaurants/10/reviews/new?reservationId=23',
      )
    })
  })

  it('uses route state to select the initial active tab', async () => {
    mockLocationStore.state = { activeTab: 'review' }

    renderTodayRestaurantPage()

    expect(await screen.findByRole('tab', { name: /리뷰/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('opens login bottom sheet for unauthenticated reservation action', async () => {
    renderTodayRestaurantPage()

    fireEvent.click(await screen.findByRole('button', { name: '예약하기' }))

    expect(screen.getByRole('dialog', { name: '로그인 안내' })).toBeTruthy()
  })

  it('starts Kakao OAuth from the login bottom sheet with the today path', async () => {
    renderTodayRestaurantPage()

    fireEvent.click(await screen.findByRole('button', { name: '예약하기' }))
    fireEvent.click(
      screen.getByRole('button', { name: '카카오로 1초 만에 시작하기' }),
    )

    expect(mockStartKakaoOAuth).toHaveBeenCalledWith('/restaurants/today')
  })

  it('navigates to reservation page for authenticated reservation action', async () => {
    mockAuthStore.isAuthenticated = true

    renderTodayRestaurantPage()

    fireEvent.click(await screen.findByRole('button', { name: '예약하기' }))

    expect(mockNavigate).toHaveBeenCalledWith(
      '/restaurants/10/reservations/new',
    )
  })

  it('opens login bottom sheet for unauthenticated like action', async () => {
    renderTodayRestaurantPage()

    fireEvent.click(await screen.findByRole('button', { name: '좋아요' }))

    expect(screen.getByRole('dialog', { name: '로그인 안내' })).toBeTruthy()
    expect(
      screen.queryByRole('heading', { name: '서비스를 준비하고 있어요.' }),
    ).not.toBeInTheDocument()
  })

  it('opens coming soon dialog for authenticated like action', async () => {
    mockAuthStore.isAuthenticated = true

    renderTodayRestaurantPage()

    fireEvent.click(await screen.findByRole('button', { name: '좋아요' }))

    expect(
      screen.getByRole('heading', { name: '서비스를 준비하고 있어요.' }),
    ).toBeTruthy()
  })

  it('gets another random recommendation excluding current restaurant when recommend again is pressed', async () => {
    mockedGetRandomRestaurantRecommendation
      .mockResolvedValueOnce(todayRestaurantSummary)
      .mockResolvedValueOnce(nextRestaurantSummary)

    renderTodayRestaurantPage()

    expect(
      await screen.findByText('야키니쿠 리키마루 이케부쿠로 히가시구치 텐'),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: '메뉴' }))
    expect(screen.getByRole('tab', { name: '메뉴' })).toHaveAttribute(
      'aria-selected',
      'true',
    )

    fireEvent.click(screen.getByRole('button', { name: '다시 추천 받기' }))

    await waitFor(() => {
      expect(mockedGetRandomRestaurantRecommendation).toHaveBeenCalledWith({
        excludeRestaurantId: 10,
      })
    })
    expect(await screen.findByText('하시 라멘')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '매장 정보' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('copies the today restaurant link when share is pressed', async () => {
    renderTodayRestaurantPage()

    fireEvent.click(await screen.findByRole('button', { name: '공유하기' }))

    expect(mockClipboardWriteText).toHaveBeenCalledWith(
      `${window.location.origin}/restaurants/today`,
    )
  })

  it('copies the restaurant name and shows a toast when name copy is pressed', async () => {
    renderTodayRestaurantPage()

    fireEvent.click(await screen.findByRole('button', { name: '식당명 복사' }))

    expect(mockClipboardWriteText).toHaveBeenCalledWith(
      '야키니쿠 리키마루 이케부쿠로 히가시구치 텐',
    )
    await waitFor(() => {
      expect(mockToastQueueClear).toHaveBeenCalled()
      expect(mockShowToast).toHaveBeenCalledWith({
        children: '식당명이 복사되었어요',
      })
    })
  })

  it('copies the restaurant name from fallback selection when Clipboard API rejects', async () => {
    const selectedButtonText = document.createElement('button')
    selectedButtonText.textContent = '식당명 복사버튼'
    document.body.append(selectedButtonText)

    const range = document.createRange()
    range.selectNodeContents(selectedButtonText)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)

    mockClipboardWriteText.mockRejectedValue(new Error('not allowed'))
    mockExecCommand.mockImplementation(() => {
      expect(window.getSelection()?.toString()).toBe(
        '야키니쿠 리키마루 이케부쿠로 히가시구치 텐',
      )

      return true
    })

    renderTodayRestaurantPage()

    fireEvent.click(await screen.findByRole('button', { name: '식당명 복사' }))

    await waitFor(() => {
      expect(mockExecCommand).toHaveBeenCalledWith('copy')
    })
  })
})
