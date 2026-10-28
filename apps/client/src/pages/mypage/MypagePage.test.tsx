import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, render, screen } from '@testing-library/react'
import { ErrorBoundary } from 'react-error-boundary'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MypagePage } from '@/pages/mypage/MypagePage'
import {
  clearAuthSession,
  startAuthenticatedSession,
} from '@/shared/auth/authSession'

const { mockRequest, mockNavigate } = vi.hoisted(() => ({
  mockRequest: vi.fn(),
  mockNavigate: vi.fn(),
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
  it('내가 찜한 식당에서 실제 컬렉션 목록을 연다', async () => {
    renderMypagePage()
    const user = (await import('@testing-library/user-event')).default.setup()
    await user.click(
      await screen.findByRole('button', { name: /내가 찜한 식당/ }),
    )
    expect(mockNavigate).toHaveBeenCalledWith('/saved')
    expect(
      screen.queryByText('서비스를 준비하고 있어요.'),
    ).not.toBeInTheDocument()
  })
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

      if (path === '/api/v1/users/me/saved-restaurants/count') {
        return Promise.resolve({ savedRestaurantCount: 12 })
      }

      return Promise.resolve({ reviewCount: 8 })
    })
  })

  afterEach(() => {
    cleanup()
    clearAuthSession()
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('shows loading screen before required API responses settle', async () => {
    const defaultRequest = mockRequest.getMockImplementation()!
    mockRequest.mockImplementation((path: string, ...args: unknown[]) =>
      path === '/api/v1/users/me/saved-restaurants/count'
        ? new Promise(() => {})
        : defaultRequest(path, ...args),
    )

    renderMypagePage()

    expect(await screen.findByRole('status')).toHaveTextContent('로딩 중이에요')
    expect(
      screen.queryByRole('heading', { name: '테스트유저님' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('0 P')).not.toBeInTheDocument()
  })

  it('lets API request failures propagate to the error boundary', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const defaultRequest = mockRequest.getMockImplementation()!
    mockRequest.mockImplementation((path: string, ...args: unknown[]) =>
      path === '/api/v1/points/me'
        ? Promise.reject(new Error('point request failed'))
        : defaultRequest(path, ...args),
    )

    renderMypagePage()

    expect(await screen.findByRole('alert')).toHaveTextContent('boundary error')
    expect(screen.queryByText('0 P')).not.toBeInTheDocument()
  })

  it.each([null, { savedRestaurantCount: -1 }])(
    'does not show a fabricated zero when the saved count response is invalid: %j',
    async (response) => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const defaultRequest = mockRequest.getMockImplementation()!
      mockRequest.mockImplementation((path: string, ...args: unknown[]) =>
        path === '/api/v1/users/me/saved-restaurants/count'
          ? Promise.resolve(response)
          : defaultRequest(path, ...args),
      )

      renderMypagePage()

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'boundary error',
      )
      expect(
        screen.queryByRole('button', { name: /내가 찜한 식당/ }),
      ).not.toBeInTheDocument()
    },
  )

  it('ignores a previous session count that arrives after switching accounts', async () => {
    let resolvePrevious!: (value: { savedRestaurantCount: number }) => void
    let countRequests = 0
    const defaultRequest = mockRequest.getMockImplementation()!
    mockRequest.mockImplementation((path: string, ...args: unknown[]) => {
      if (path !== '/api/v1/users/me/saved-restaurants/count') {
        return defaultRequest(path, ...args)
      }
      countRequests += 1
      return countRequests === 1
        ? new Promise((resolve) => {
            resolvePrevious = resolve
          })
        : Promise.resolve({ savedRestaurantCount: 3 })
    })
    renderMypagePage()

    await act(async () => {
      startAuthenticatedSession('another-account')
    })
    expect(
      await screen.findByRole('button', { name: '내가 찜한 식당 3' }),
    ).toBeInTheDocument()

    await act(async () => {
      resolvePrevious({ savedRestaurantCount: 12 })
    })
    expect(
      screen.getByRole('button', { name: '내가 찜한 식당 3' }),
    ).toBeInTheDocument()
  })
})
