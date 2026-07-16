import '@testing-library/jest-dom/vitest'

import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RootLayout } from '@/app/layout/RootLayout'

const { mockAsyncBoundary, mockToastRegion, mockTrackPageView } = vi.hoisted(
  () => ({
    mockAsyncBoundary: vi.fn(
      ({
        children,
        resetKeys,
      }: {
        children: ReactNode
        resetKeys?: unknown[]
      }) => (
        <div
          data-testid="async-boundary"
          data-reset-key={String(resetKeys?.[0] ?? '')}
        >
          {children}
        </div>
      ),
    ),
    mockToastRegion: vi.fn(({ className }: { className?: string }) => (
      <div data-testid="toast-region" data-class-name={className} />
    )),
    mockTrackPageView: vi.fn(),
  }),
)
const { mockLocationStore, mockScrollTo } = vi.hoisted(() => ({
  mockLocationStore: {
    hash: '',
    pathname: '/',
    search: '',
  },
  mockScrollTo: vi.fn(),
}))

vi.mock('@hashi/hds-ui', () => ({
  ToastRegion: mockToastRegion,
}))

vi.mock('@/app/providers/AsyncBoundary', () => ({
  default: mockAsyncBoundary,
}))

vi.mock('@/shared/lib/analytics', () => ({
  trackPageView: mockTrackPageView,
}))

vi.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="route-outlet" />,
  useLocation: () => mockLocationStore,
}))

describe('RootLayout', () => {
  beforeEach(() => {
    vi.stubGlobal('scrollTo', mockScrollTo)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    mockAsyncBoundary.mockClear()
    mockToastRegion.mockClear()
    mockScrollTo.mockClear()
    mockTrackPageView.mockClear()
    mockLocationStore.hash = ''
    mockLocationStore.pathname = '/'
    mockLocationStore.search = ''
  })

  it('positions the toast region at the top of the mobile frame with 20px horizontal padding', () => {
    render(<RootLayout />)

    expect(screen.getByTestId('toast-region')).toHaveAttribute(
      'data-class-name',
      'z-toast fixed inset-x-0 top-0 mx-auto w-full max-w-[var(--app-mobile-max-width,100%)] px-5 pt-[calc(32px+var(--safe-area-top,0px))]',
    )
  })

  it('keeps route content inside AsyncBoundary and ToastRegion outside it', () => {
    render(<RootLayout />)

    const boundary = screen.getByTestId('async-boundary')
    const outlet = screen.getByTestId('route-outlet')
    const toastRegion = screen.getByTestId('toast-region')

    expect(boundary).toContainElement(outlet)
    expect(boundary).not.toContainElement(toastRegion)
  })

  it('scrolls to the top when the route pathname changes', () => {
    const { rerender } = render(<RootLayout />)

    mockScrollTo.mockClear()
    mockLocationStore.pathname = '/restaurants/restaurant-1'
    rerender(<RootLayout />)

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: 'auto',
    })
  })

  it('uses the current pathname as the AsyncBoundary reset key', () => {
    const { rerender } = render(<RootLayout />)

    expect(screen.getByTestId('async-boundary')).toHaveAttribute(
      'data-reset-key',
      '/',
    )

    mockLocationStore.pathname = '/restaurants/restaurant-1'
    rerender(<RootLayout />)

    expect(screen.getByTestId('async-boundary')).toHaveAttribute(
      'data-reset-key',
      '/restaurants/restaurant-1',
    )
  })

  it('tracks page views with pathname, search, and hash', () => {
    const { rerender } = render(<RootLayout />)

    expect(mockTrackPageView).toHaveBeenCalledWith('/')

    mockTrackPageView.mockClear()
    mockLocationStore.pathname = '/restaurants/restaurant-1'
    mockLocationStore.search = '?tab=review'
    mockLocationStore.hash = '#photos'
    rerender(<RootLayout />)

    expect(mockTrackPageView).toHaveBeenCalledWith(
      '/restaurants/restaurant-1?tab=review#photos',
    )
  })
})
