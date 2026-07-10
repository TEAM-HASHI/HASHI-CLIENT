import '@testing-library/jest-dom/vitest'

import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RootLayout } from '@/app/layout/RootLayout'

const { mockAsyncBoundary, mockToastRegion } = vi.hoisted(() => ({
  mockAsyncBoundary: vi.fn(({ children }: { children: ReactNode }) => (
    <div data-testid="async-boundary">{children}</div>
  )),
  mockToastRegion: vi.fn(({ className }: { className?: string }) => (
    <div data-testid="toast-region" data-class-name={className} />
  )),
}))
const { mockLocationStore, mockScrollTo } = vi.hoisted(() => ({
  mockLocationStore: {
    pathname: '/',
  },
  mockScrollTo: vi.fn(),
}))

vi.mock('@hashi/hds-ui', () => ({
  ToastRegion: mockToastRegion,
}))

vi.mock('@/app/providers/AsyncBoundary', () => ({
  default: mockAsyncBoundary,
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
    mockToastRegion.mockClear()
    mockScrollTo.mockClear()
    mockLocationStore.pathname = '/'
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
})
