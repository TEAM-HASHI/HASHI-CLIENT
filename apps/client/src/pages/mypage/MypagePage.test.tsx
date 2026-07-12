import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import { ErrorBoundary } from 'react-error-boundary'
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
        throwOnError: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary fallback={<p role="alert">boundary error</p>}>
        <MypagePage />
      </ErrorBoundary>
    </QueryClientProvider>,
  )
}

describe('MypagePage', () => {
  beforeEach(() => {
    mockRequest.mockImplementation((path: string) => {
      if (path === '/api/v1/users/me/profile-summary') {
        return Promise.resolve({
          nickname: '테스트유저',
          profileImageUrl: 'https://example.com/profile.png',
        })
      }

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

  it('shows loading screen before required API responses settle', async () => {
    mockRequest.mockImplementation((path: string) => {
      if (path === '/api/v1/users/me/profile-summary') {
        return new Promise(() => {})
      }

      if (path === '/api/v1/points/me') {
        return Promise.resolve({ balance: 7000 })
      }

      return Promise.resolve({ reviewCount: 8 })
    })

    renderMypagePage()

    expect(await screen.findByRole('status')).toHaveTextContent('로딩 중이에요')
    expect(
      screen.queryByRole('heading', { name: '하시님' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('0 P')).not.toBeInTheDocument()
  })

  it('renders primary action buttons with design token colors', async () => {
    renderMypagePage()

    expect(await screen.findByRole('button', { name: '수정' })).toHaveClass(
      'bg-cool-gray-800',
    )
    expect(screen.getByRole('button', { name: /내가 찜한 식당/ })).toHaveClass(
      'bg-cool-gray-800',
    )
  })

  it('renders saved restaurant count as zero during MVP', async () => {
    renderMypagePage()

    expect(
      await screen.findByRole('button', { name: /내가 찜한 식당 0/ }),
    ).toBeInTheDocument()
  })

  it('renders my review count from the API response', async () => {
    mockRequest.mockImplementation((path: string) => {
      if (path === '/api/v1/users/me/profile-summary') {
        return Promise.resolve({
          nickname: '테스트유저',
          profileImageUrl: 'https://example.com/profile.png',
        })
      }

      if (path === '/api/v1/points/me') {
        return Promise.resolve({ balance: 7000 })
      }

      if (path === '/api/v1/reviews/me/count') {
        return Promise.resolve({ reviewCount: 3 })
      }

      return Promise.resolve(null)
    })

    renderMypagePage()

    expect(
      await screen.findByRole('button', { name: /마이 리뷰 3/ }),
    ).toBeInTheDocument()
    expect(request).toHaveBeenCalledWith('/api/v1/reviews/me/count')
  })

  it('renders available point from the API response', async () => {
    mockRequest.mockImplementation((path: string) => {
      if (path === '/api/v1/users/me/profile-summary') {
        return Promise.resolve({
          nickname: '테스트유저',
          profileImageUrl: 'https://example.com/profile.png',
        })
      }

      if (path === '/api/v1/points/me') {
        return Promise.resolve({ balance: 12345 })
      }

      return Promise.resolve({ reviewCount: 8 })
    })

    renderMypagePage()

    expect(await screen.findByText('12,345 P')).toBeInTheDocument()
    expect(request).toHaveBeenCalledWith('/api/v1/points/me')
  })

  it('renders profile summary from the API response', async () => {
    renderMypagePage()

    expect(
      await screen.findByRole('heading', { name: '테스트유저님' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: '테스트유저 프로필 이미지' }),
    ).toHaveAttribute('src', 'https://example.com/profile.png')
    expect(request).toHaveBeenCalledWith('/api/v1/users/me/profile-summary')
  })

  it('lets API request failures propagate to the error boundary', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockRequest.mockImplementation((path: string) => {
      if (path === '/api/v1/points/me') {
        return Promise.reject(new Error('point request failed'))
      }

      if (path === '/api/v1/users/me/profile-summary') {
        return Promise.resolve({
          nickname: '테스트유저',
          profileImageUrl: 'https://example.com/profile.png',
        })
      }

      return Promise.resolve({ reviewCount: 8 })
    })

    renderMypagePage()

    expect(await screen.findByRole('alert')).toHaveTextContent('boundary error')
    expect(screen.queryByText('0 P')).not.toBeInTheDocument()
  })

  it('renders confirmed notice and terms links as external links', async () => {
    renderMypagePage()

    expect(
      await screen.findByRole('link', { name: '공지사항' }),
    ).toHaveAttribute('href', HASHI_NOTICE_URL)
    expect(screen.getByRole('link', { name: '이용약관' })).toHaveAttribute(
      'href',
      HASHI_TERMS_URL,
    )
  })

  it('does not render the MVP-excluded account section', async () => {
    renderMypagePage()

    expect(
      await screen.findByRole('heading', { name: '테스트유저님' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('계정')).not.toBeInTheDocument()
    expect(screen.queryByText('로그아웃')).not.toBeInTheDocument()
    expect(screen.queryByText('회원탈퇴')).not.toBeInTheDocument()
  })
})
