import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  HASHI_NOTICE_URL,
  HASHI_TERMS_URL,
} from '@/pages/mypage/constants/mypageMenu'
import { MypagePage } from '@/pages/mypage/MypagePage'
import { request } from '@/shared/api/request'

const { mockNavigate, mockRequest } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockRequest: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/shared/api/request', () => ({
  request: mockRequest,
}))

const renderMypagePage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MypagePage />
    </QueryClientProvider>,
  )
}

describe('MypagePage', () => {
  beforeEach(() => {
    mockRequest.mockImplementation((path: string) => {
      if (path === '/api/v1/points/me') {
        return Promise.resolve({ balance: 7000 })
      }

      return Promise.resolve({ reviewCount: 8 })
    })
  })

  afterEach(() => {
    cleanup()
    mockNavigate.mockClear()
    vi.clearAllMocks()
  })

  it('renders primary action buttons with design token colors', () => {
    renderMypagePage()

    expect(screen.getByRole('button', { name: '수정' })).toHaveClass(
      'bg-cool-gray-800',
    )
    expect(screen.getByRole('button', { name: /내가 찜한 식당/ })).toHaveClass(
      'bg-cool-gray-800',
    )
  })

  it('renders saved restaurant count as zero during MVP', () => {
    renderMypagePage()

    expect(
      screen.getByRole('button', { name: /내가 찜한 식당 0/ }),
    ).toBeInTheDocument()
  })

  it('renders my review count from the API response', async () => {
    mockRequest.mockImplementation((path: string) => {
      if (path === '/api/v1/reviews/me/count') {
        return Promise.resolve({ reviewCount: 3 })
      }

      return Promise.resolve({ balance: 7000 })
    })

    renderMypagePage()

    expect(
      await screen.findByRole('button', { name: /마이 리뷰 3/ }),
    ).toBeInTheDocument()
    expect(request).toHaveBeenCalledWith('/api/v1/reviews/me/count')
  })

  it('renders available point from the API response', async () => {
    mockRequest.mockImplementation((path: string) => {
      if (path === '/api/v1/points/me') {
        return Promise.resolve({ balance: 12345 })
      }

      return Promise.resolve({ reviewCount: 8 })
    })

    renderMypagePage()

    expect(await screen.findByText('12,345 P')).toBeInTheDocument()
    expect(request).toHaveBeenCalledWith('/api/v1/points/me')
  })

  it('renders confirmed notice and terms links as external links', () => {
    renderMypagePage()

    expect(screen.getByRole('link', { name: '공지사항' })).toHaveAttribute(
      'href',
      HASHI_NOTICE_URL,
    )
    expect(screen.getByRole('link', { name: '이용약관' })).toHaveAttribute(
      'href',
      HASHI_TERMS_URL,
    )
  })

  it('does not render the MVP-excluded account section', () => {
    renderMypagePage()

    expect(screen.queryByText('계정')).not.toBeInTheDocument()
    expect(screen.queryByText('로그아웃')).not.toBeInTheDocument()
    expect(screen.queryByText('회원탈퇴')).not.toBeInTheDocument()
  })
})
