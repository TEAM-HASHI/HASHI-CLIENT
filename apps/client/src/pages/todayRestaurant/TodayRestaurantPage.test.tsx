import '@testing-library/jest-dom/vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TodayRestaurantPage } from '@/pages/todayRestaurant/TodayRestaurantPage'

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
const { mockClipboardWriteText, mockShowToast } = vi.hoisted(() => ({
  mockClipboardWriteText: vi.fn(),
  mockShowToast: vi.fn(),
}))
const { mockExecCommand } = vi.hoisted(() => ({
  mockExecCommand: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useLocation: () => ({ state: mockLocationStore.state }),
    useNavigate: () => mockNavigate,
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

describe('TodayRestaurantPage', () => {
  beforeEach(() => {
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
    mockNavigate.mockClear()
    mockClipboardWriteText.mockReset()
    mockShowToast.mockReset()
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

    render(<TodayRestaurantPage />)

    expect(screen.getByTestId('restaurant-detail-fixed-header')).toHaveClass(
      'fixed',
      'top-0',
    )
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

  it('switches tabs and opens the review unavailable modal from review CTA', () => {
    render(<TodayRestaurantPage />)

    fireEvent.click(screen.getByRole('tab', { name: '메뉴' }))

    expect(screen.getByRole('tab', { name: '메뉴' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getAllByText('시오라멘')[0]).toBeTruthy()

    fireEvent.click(screen.getAllByRole('button', { name: /시오라멘/ })[0])

    expect(mockNavigate).toHaveBeenCalledWith(
      '/restaurants/default/menus/shio-ramen-1',
      { state: { source: 'today' } },
    )

    fireEvent.click(screen.getByRole('tab', { name: /리뷰/ }))
    fireEvent.click(screen.getByRole('button', { name: '리뷰 작성하기' }))

    expect(
      screen.getByRole('heading', { name: '실제 방문자만 작성할 수 있어요' }),
    ).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: '확인' }))

    expect(
      screen.queryByRole('heading', { name: '실제 방문자만 작성할 수 있어요' }),
    ).not.toBeInTheDocument()
  })

  it('uses route state to select the initial active tab', () => {
    mockLocationStore.state = { activeTab: 'review' }

    render(<TodayRestaurantPage />)

    expect(screen.getByRole('tab', { name: /리뷰/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('opens login bottom sheet for unauthenticated reservation action', () => {
    render(<TodayRestaurantPage />)

    fireEvent.click(screen.getByRole('button', { name: '예약하기' }))

    expect(screen.getByRole('dialog', { name: '로그인 안내' })).toBeTruthy()
  })

  it('navigates to reservation page for authenticated reservation action', () => {
    mockAuthStore.isAuthenticated = true

    render(<TodayRestaurantPage />)

    fireEvent.click(screen.getByRole('button', { name: '예약하기' }))

    expect(mockNavigate).toHaveBeenCalledWith(
      '/restaurants/default/reservations/new',
    )
  })

  it('opens login bottom sheet for unauthenticated like action', () => {
    render(<TodayRestaurantPage />)

    fireEvent.click(screen.getByRole('button', { name: '좋아요' }))

    expect(screen.getByRole('dialog', { name: '로그인 안내' })).toBeTruthy()
    expect(
      screen.queryByRole('heading', { name: '서비스를 준비하고 있어요.' }),
    ).not.toBeInTheDocument()
  })

  it('opens coming soon dialog for authenticated like action', () => {
    mockAuthStore.isAuthenticated = true

    render(<TodayRestaurantPage />)

    fireEvent.click(screen.getByRole('button', { name: '좋아요' }))

    expect(
      screen.getByRole('heading', { name: '서비스를 준비하고 있어요.' }),
    ).toBeTruthy()
  })

  it('copies the today restaurant link when share is pressed', () => {
    render(<TodayRestaurantPage />)

    fireEvent.click(screen.getByRole('button', { name: '공유하기' }))

    expect(mockClipboardWriteText).toHaveBeenCalledWith(
      `${window.location.origin}/restaurants/today`,
    )
  })

  it('copies the restaurant name when name copy is pressed', () => {
    render(<TodayRestaurantPage />)

    fireEvent.click(screen.getByRole('button', { name: '식당명 복사' }))

    expect(mockClipboardWriteText).toHaveBeenCalledWith(
      '야키니쿠 리키마루 이케부쿠로 히가시구치 텐',
    )
    expect(mockShowToast).not.toHaveBeenCalled()
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

    render(<TodayRestaurantPage />)

    fireEvent.click(screen.getByRole('button', { name: '식당명 복사' }))

    await waitFor(() => {
      expect(mockExecCommand).toHaveBeenCalledWith('copy')
    })
  })
})
