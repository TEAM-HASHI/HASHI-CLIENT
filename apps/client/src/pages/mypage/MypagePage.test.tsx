import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import { ErrorBoundary } from 'react-error-boundary'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MypagePage } from '@/pages/mypage/MypagePage'

const { mockRequest } = vi.hoisted(() => ({
  mockRequest: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => vi.fn(),
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
    vi.restoreAllMocks()
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
      screen.queryByRole('heading', { name: '테스트유저님' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('0 P')).not.toBeInTheDocument()
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
})
