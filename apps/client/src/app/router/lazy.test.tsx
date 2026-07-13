import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { appRoutes } from '@/app/router/routes'

let isAuthenticated = false

vi.mock('@/shared/hooks/useAuthStatus', () => ({
  useAuthStatus: () => ({
    isAuthenticated,
    status: isAuthenticated ? 'authenticated' : 'unauthenticated',
  }),
}))

vi.mock('@/features/magazine/api/getMagazineBanners', () => ({
  getMagazineBanners: vi.fn(async () => ({ banners: [] })),
}))

vi.mock('@/pages/mypage', () => ({
  default: () => <main>마이페이지 화면</main>,
}))

vi.mock(
  '@/pages/loginRequired',
  () =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          default: () => <main>로그인 필요 페이지</main>,
        })
      }, 200)
    }),
)

vi.mock(
  '@/pages/hashiPick',
  () =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          default: () => <main>하시픽 화면</main>,
        })
      }, 200)
    }),
)

vi.mock(
  '@/pages/myReviews',
  () =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          default: () => <main>마이 리뷰</main>,
        })
      }, 200)
    }),
)

const createSignalCompatibleRequest = (NativeRequest: typeof Request) =>
  function SignalCompatibleRequest(
    input: RequestInfo | URL,
    init?: RequestInit,
  ) {
    try {
      return new NativeRequest(input, init)
    } catch (error) {
      if (
        error instanceof TypeError &&
        error.message.includes('Expected signal')
      ) {
        const nextInit = { ...init }
        delete nextInit.signal

        return new NativeRequest(input, nextInit)
      }

      throw error
    }
  } as unknown as typeof Request

describe('route lazy fallback', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.unstubAllGlobals()
    isAuthenticated = false
  })

  it('delays LoadingScreen and keeps it visible for the minimum duration when a lazy route is pending', async () => {
    vi.useFakeTimers()

    const router = createMemoryRouter(appRoutes, {
      initialEntries: ['/login-required'],
    })

    render(<RouterProvider router={router} />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(149)
    })

    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })

    expect(screen.getByRole('status')).toHaveTextContent('로딩 중이에요')
    expect(screen.queryByText('홈')).not.toBeInTheDocument()
    expect(screen.queryByText('마이')).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(299)
    })

    expect(screen.getByRole('status')).toHaveTextContent('로딩 중이에요')
    expect(screen.queryByText('로그인 필요 페이지')).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })

    expect(screen.getByText('로그인 필요 페이지')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('does not show LoadingScreen for restaurant list routes that render page skeletons', async () => {
    vi.useFakeTimers()

    const router = createMemoryRouter(appRoutes, {
      initialEntries: ['/restaurants/hashi-pick'],
    })

    render(<RouterProvider router={router} />)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(150)
    })

    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(850)
    })

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('renders the next page as soon as the chunk resolves when the fallback is not shown during an AuthOnly boundary navigation', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('Request', createSignalCompatibleRequest(Request))
    isAuthenticated = true

    const router = createMemoryRouter(appRoutes, {
      initialEntries: ['/mypage'],
    })

    render(<RouterProvider router={router} />)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.getByText('마이페이지 화면')).toBeInTheDocument()
    expect(screen.getByText('마이')).toBeInTheDocument()

    await act(async () => {
      await router.navigate('/my-reviews')
    })

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByText('마이페이지 화면')).toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(199)
    })

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByText('마이 리뷰')).not.toBeInTheDocument()
    expect(screen.getByText('마이페이지 화면')).toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })

    expect(screen.getByText('마이 리뷰')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByText('마이페이지 화면')).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(250)
    })

    expect(screen.getByText('마이 리뷰')).toBeInTheDocument()
  })
})
