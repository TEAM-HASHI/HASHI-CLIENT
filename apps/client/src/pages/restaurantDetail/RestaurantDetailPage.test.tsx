import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RestaurantDetailPage } from '@/pages/restaurantDetail/RestaurantDetailPage'

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
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
const { mockRequestAnimationFrame, mockScrollTo } = vi.hoisted(() => ({
  mockRequestAnimationFrame: vi.fn((callback: FrameRequestCallback) => {
    callback(0)
    return 0
  }),
  mockScrollTo: vi.fn(),
}))
const { mockClipboardWriteText, mockShowToast } = vi.hoisted(() => ({
  mockClipboardWriteText: vi.fn(),
  mockShowToast: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useLocation: () => ({ state: mockLocationStore.state }),
    useNavigate: () => mockNavigate,
    useParams: () => ({ restaurantId: 'default' }),
  }
})

vi.mock('@/shared/hooks', () => ({
  useAuthStatus: () => ({
    isAuthenticated: mockAuthStore.isAuthenticated,
    status: mockAuthStore.isAuthenticated ? 'authenticated' : 'unauthenticated',
  }),
}))

vi.mock('@hashi/hds-ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hashi/hds-ui')>()

  return {
    ...actual,
    showToast: mockShowToast,
  }
})

describe('RestaurantDetailPage', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: mockClipboardWriteText,
      },
    })
    vi.stubGlobal('requestAnimationFrame', mockRequestAnimationFrame)
    vi.stubGlobal('scrollTo', mockScrollTo)
  })

  afterEach(() => {
    cleanup()
    mockNavigate.mockClear()
    mockClipboardWriteText.mockClear()
    mockShowToast.mockClear()
    mockRequestAnimationFrame.mockClear()
    mockScrollTo.mockClear()
    mockLocationStore.state = undefined
    mockAuthStore.isAuthenticated = false
    vi.unstubAllGlobals()
  })

  it('renders restaurant detail without recommend again action', () => {
    render(<RestaurantDetailPage />)

    expect(screen.getByRole('main')).toHaveClass(
      'pb-[calc(82px+var(--safe-area-bottom,0px))]',
    )
    expect(screen.getByRole('heading', { name: '식당 상세 정보' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: '매장 정보' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(
      screen.queryByRole('button', { name: '다시 추천 받기' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '예약하기' })).toBeTruthy()
  })

  it('renders review content and opens review image viewer', () => {
    render(<RestaurantDetailPage />)

    fireEvent.click(screen.getByRole('tab', { name: /리뷰/ }))

    expect(screen.getAllByText('혁줌마')).toHaveLength(10)
    expect(screen.getAllByText(/정말 맛있습니다 와우/)[0]).toBeTruthy()
    expect(screen.getByRole('button', { name: '최신순' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    fireEvent.click(screen.getAllByRole('button', { name: /리뷰 이미지/ })[0])

    expect(
      screen.getByRole('dialog', { name: '리뷰 이미지 상세보기' }),
    ).toBeTruthy()
    expect(
      screen
        .getAllByTestId('review-image-viewer-image')[0]
        .querySelector('img'),
    ).not.toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: '리뷰 이미지 상세보기 닫기' }),
    )

    expect(
      screen.queryByRole('dialog', { name: '리뷰 이미지 상세보기' }),
    ).not.toBeInTheDocument()
  })

  it('navigates to menu detail when a menu item is pressed', () => {
    render(<RestaurantDetailPage />)

    fireEvent.click(screen.getByRole('tab', { name: '메뉴' }))
    fireEvent.click(screen.getAllByRole('button', { name: /시오라멘/ })[0])

    expect(mockNavigate).toHaveBeenCalledWith(
      '/restaurants/default/menus/shio-ramen-1',
      { state: { source: 'detail' } },
    )
  })

  it('uses route state to select the initial active tab', () => {
    mockLocationStore.state = { activeTab: 'review' }

    render(<RestaurantDetailPage />)

    expect(screen.getByRole('tab', { name: /리뷰/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('opens login bottom sheet for unauthenticated reservation action', () => {
    render(<RestaurantDetailPage />)

    fireEvent.click(screen.getByRole('button', { name: '예약하기' }))

    expect(screen.getByRole('dialog', { name: '로그인 안내' })).toBeTruthy()
    expect(mockNavigate).not.toHaveBeenCalledWith(
      '/restaurants/default/reservations/new',
    )
  })

  it('navigates to reservation page for authenticated reservation action', () => {
    mockAuthStore.isAuthenticated = true

    render(<RestaurantDetailPage />)

    fireEvent.click(screen.getByRole('button', { name: '예약하기' }))

    expect(mockNavigate).toHaveBeenCalledWith(
      '/restaurants/default/reservations/new',
    )
  })

  it('opens login bottom sheet for unauthenticated like action', () => {
    render(<RestaurantDetailPage />)

    fireEvent.click(screen.getByRole('button', { name: '좋아요' }))

    expect(screen.getByRole('dialog', { name: '로그인 안내' })).toBeTruthy()
    expect(
      screen.queryByRole('heading', { name: '서비스를 준비하고 있어요.' }),
    ).not.toBeInTheDocument()
  })

  it('opens coming soon dialog for authenticated like action', () => {
    mockAuthStore.isAuthenticated = true

    render(<RestaurantDetailPage />)

    fireEvent.click(screen.getByRole('button', { name: '좋아요' }))

    expect(
      screen.getByRole('heading', { name: '서비스를 준비하고 있어요.' }),
    ).toBeTruthy()
  })

  it('scrolls to the tab content position when menu tab is selected', () => {
    render(<RestaurantDetailPage />)

    fireEvent.click(screen.getByRole('tab', { name: '메뉴' }))

    expect(mockScrollTo).toHaveBeenCalledWith({ top: expect.any(Number) })
  })

  it('copies the current page link when share is pressed', () => {
    render(<RestaurantDetailPage />)

    fireEvent.click(screen.getByRole('button', { name: '공유하기' }))

    expect(mockClipboardWriteText).toHaveBeenCalledWith(
      `${window.location.origin}/restaurants/default`,
    )
  })

  it('copies the restaurant name when name copy is pressed', () => {
    render(<RestaurantDetailPage />)

    fireEvent.click(screen.getByRole('button', { name: '식당명 복사' }))

    expect(mockClipboardWriteText).toHaveBeenCalledWith(
      '야키니쿠 리키마루 이케부쿠로 히가시구치 텐',
    )
    expect(mockShowToast).not.toHaveBeenCalled()
  })
})
