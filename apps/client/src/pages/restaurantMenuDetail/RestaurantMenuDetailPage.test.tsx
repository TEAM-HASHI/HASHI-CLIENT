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
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  }
})

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
    vi.unstubAllGlobals()
  })

  it('renders selected menu detail and other menus', () => {
    render(<RestaurantMenuDetailPage />)

    expect(screen.getByRole('main')).toHaveClass(
      'pb-[calc(82px+var(--safe-area-bottom,0px))]',
    )
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

    expect(mockClipboardWriteText).toHaveBeenCalledWith(window.location.href)
  })
})
