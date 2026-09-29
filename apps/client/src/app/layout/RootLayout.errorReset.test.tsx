import '@testing-library/jest-dom/vitest'

import { act, cleanup, render, screen } from '@testing-library/react'
import {
  createMemoryRouter,
  RouterProvider,
  useLocation,
} from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RootLayout } from '@/app/layout/RootLayout'

const { mockCaptureError, mockTrackPageView, mockScrollTo } = vi.hoisted(
  () => ({
    mockCaptureError: vi.fn(),
    mockTrackPageView: vi.fn(),
    mockScrollTo: vi.fn(),
  }),
)

vi.mock('@/shared/lib/analytics', () => ({
  trackPageView: mockTrackPageView,
}))

vi.mock('@/shared/lib/sentry', () => ({
  captureError: mockCaptureError,
}))

const SearchRouteContent = () => {
  const { search } = useLocation()

  if (search === '?keyword=failed') {
    throw new Error('search route failed')
  }

  return <p>search route recovered</p>
}

describe('RootLayout error reset policy', () => {
  beforeEach(() => {
    vi.stubGlobal('scrollTo', mockScrollTo)
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('recovers from a caught route error when search params change', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <RootLayout />,
          children: [
            {
              path: 'search',
              element: <SearchRouteContent />,
            },
          ],
        },
      ],
      { initialEntries: ['/search?keyword=failed'] },
    )

    render(<RouterProvider router={router} />)

    expect(await screen.findByRole('alert')).toBeInTheDocument()

    await act(async () => {
      await router.navigate('/search?keyword=recovered')
    })

    expect(
      await screen.findByText('search route recovered'),
    ).toBeInTheDocument()
  })

  it('keeps a caught route error when only the hash changes', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    let routeRenderCount = 0
    const FailingRouteContent = () => {
      routeRenderCount += 1
      throw new Error('route failed')
    }
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <RootLayout />,
          children: [
            {
              path: 'search',
              element: <FailingRouteContent />,
            },
          ],
        },
      ],
      { initialEntries: ['/search?keyword=failed#before'] },
    )

    render(<RouterProvider router={router} />)

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    const renderCountAfterError = routeRenderCount

    await act(async () => {
      await router.navigate('/search?keyword=failed#after')
    })

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(routeRenderCount).toBe(renderCountAfterError)
  })
})
