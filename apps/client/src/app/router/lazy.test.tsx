import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { appRoutes } from '@/app/router/routes'

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

describe('route lazy fallback', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
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
})
