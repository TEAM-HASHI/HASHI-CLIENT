import '@testing-library/jest-dom/vitest'

import { cleanup, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RootLayout } from '@/app/layout/RootLayout'

const {
  mockAsyncBoundary,
  mockAuthSessionRestoreGate,
  mockToastRegion,
  mockTrackPageView,
} = vi.hoisted(() => ({
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
  mockAuthSessionRestoreGate: vi.fn(
    ({ children, pathname }: { children: ReactNode; pathname?: string }) => (
      <div data-pathname={pathname} data-testid="auth-session-restore-gate">
        {children}
      </div>
    ),
  ),
  mockToastRegion: vi.fn(() => <div data-testid="toast-region" />),
  mockTrackPageView: vi.fn(),
}))
const {
  mockLocationStore,
  mockNavigationType,
  mockScrollTo,
  mockWindowScrollTo,
} = vi.hoisted(() => ({
  mockLocationStore: {
    hash: '',
    pathname: '/',
    search: '',
  },
  mockNavigationType: { value: 'PUSH' as 'POP' | 'PUSH' | 'REPLACE' },
  mockScrollTo: vi.fn(),
  mockWindowScrollTo: vi.fn(),
}))

vi.mock('@hashi/hds-ui', () => ({
  ToastRegion: mockToastRegion,
}))

vi.mock('@/app/providers/AsyncBoundary', () => ({
  default: mockAsyncBoundary,
}))

vi.mock('@/app/providers/AuthSessionRestoreGate', () => ({
  AuthSessionRestoreGate: mockAuthSessionRestoreGate,
}))

vi.mock('@/shared/lib/analytics', () => ({
  trackPageView: mockTrackPageView,
}))

vi.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="route-outlet" />,
  useLocation: () => mockLocationStore,
  useNavigate: () => vi.fn(),
  useNavigationType: () => mockNavigationType.value,
}))

describe('RootLayout', () => {
  beforeEach(() => {
    vi.stubGlobal('scrollTo', mockWindowScrollTo)
    vi.spyOn(HTMLElement.prototype, 'scrollTo').mockImplementation(mockScrollTo)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    mockAsyncBoundary.mockClear()
    mockAuthSessionRestoreGate.mockClear()
    mockToastRegion.mockClear()
    mockScrollTo.mockClear()
    mockWindowScrollTo.mockClear()
    mockTrackPageView.mockClear()
    mockLocationStore.hash = ''
    mockLocationStore.pathname = '/'
    mockLocationStore.search = ''
    mockNavigationType.value = 'PUSH'
  })

  it('keeps route content inside AsyncBoundary and ToastRegion outside it', () => {
    render(<RootLayout />)

    const boundary = screen.getByTestId('async-boundary')
    const authGate = screen.getByTestId('auth-session-restore-gate')
    const outlet = screen.getByTestId('route-outlet')
    const toastRegion = screen.getByTestId('toast-region')

    expect(boundary).toContainElement(authGate)
    expect(authGate).toContainElement(outlet)
    expect(boundary).not.toContainElement(toastRegion)
  })

  it('passes the current pathname to AuthSessionRestoreGate', () => {
    const { rerender } = render(<RootLayout />)

    expect(screen.getByTestId('auth-session-restore-gate')).toHaveAttribute(
      'data-pathname',
      '/',
    )

    mockLocationStore.pathname = '/restaurants/restaurant-1'
    rerender(<RootLayout />)

    expect(screen.getByTestId('auth-session-restore-gate')).toHaveAttribute(
      'data-pathname',
      '/restaurants/restaurant-1',
    )
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
    expect(mockWindowScrollTo).not.toHaveBeenCalled()
  })

  it('updates content bounds for resized and removed fixed bars without resetting scroll', async () => {
    const observe = vi.fn()
    const unobserve = vi.fn()
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = observe
        unobserve = unobserve
        disconnect = vi.fn()
      },
    )
    const { unmount } = render(<RootLayout />)
    mockScrollTo.mockClear()
    const outlet = screen.getByTestId('route-outlet')
    const header = document.createElement('header')
    const navigation = document.createElement('nav')
    const tabs = document.createElement('div')
    header.style.position = 'fixed'
    navigation.style.position = 'fixed'
    navigation.className = 'app-mobile-fixed-bottom'
    tabs.style.position = 'fixed'
    tabs.setAttribute('data-page-scroll-top', '')
    let headerHeight = 75
    const headerBounds = vi.fn(() => new DOMRect(0, 0, 430, headerHeight))
    header.getBoundingClientRect = headerBounds
    tabs.getBoundingClientRect = () => new DOMRect(0, headerHeight, 430, 50)
    navigation.getBoundingClientRect = () =>
      new DOMRect(0, window.innerHeight - 84, 430, 84)
    outlet.append(tabs, navigation, header)

    const rootStyle = document.documentElement.style
    await waitFor(() => {
      expect(rootStyle.getPropertyValue('--app-content-top')).toBe('125px')
      expect(rootStyle.getPropertyValue('--app-content-bottom')).toBe('84px')
    })
    expect(observe).toHaveBeenCalledTimes(3)
    const measurements = headerBounds.mock.calls.length
    outlet.append(document.createElement('p'))
    await waitFor(() => {
      expect(headerBounds.mock.calls.length).toBeGreaterThan(measurements)
    })
    expect(observe).toHaveBeenCalledTimes(3)
    headerHeight = 119
    window.dispatchEvent(new Event('resize'))
    expect(rootStyle.getPropertyValue('--app-content-top')).toBe('169px')
    tabs.removeAttribute('data-page-scroll-top')
    await waitFor(() => {
      expect(rootStyle.getPropertyValue('--app-content-top')).toBe('119px')
    })
    expect(unobserve).toHaveBeenCalledWith(tabs)
    header.remove()
    navigation.remove()
    await waitFor(() => {
      expect(rootStyle.getPropertyValue('--app-content-top')).toBe('0px')
      expect(rootStyle.getPropertyValue('--app-content-bottom')).toBe('0px')
    })
    expect(mockScrollTo).not.toHaveBeenCalled()
    unmount()
    expect(rootStyle.getPropertyValue('--app-content-top')).toBe('')
    expect(rootStyle.getPropertyValue('--app-content-bottom')).toBe('')
  })

  it('preserves the browser scroll position when returning to the magazine list', () => {
    const { rerender } = render(<RootLayout />)

    mockScrollTo.mockClear()
    mockNavigationType.value = 'POP'
    mockLocationStore.pathname = '/magazines'
    rerender(<RootLayout />)

    expect(mockScrollTo).not.toHaveBeenCalled()
  })

  it('leaves search POP restoration to the result list', () => {
    mockLocationStore.pathname = '/restaurants/10'
    const { rerender } = render(<RootLayout />)
    mockScrollTo.mockClear()
    mockLocationStore.pathname = '/search'
    mockNavigationType.value = 'POP'
    rerender(<RootLayout />)
    expect(mockScrollTo).not.toHaveBeenCalled()
  })

  it('scrolls to the top on history navigation to another page', () => {
    const { rerender } = render(<RootLayout />)

    mockScrollTo.mockClear()
    mockNavigationType.value = 'POP'
    mockLocationStore.pathname = '/restaurants/restaurant-1'
    rerender(<RootLayout />)

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: 'auto',
    })
  })

  it('does not reset scroll when only the navigation type changes', () => {
    mockNavigationType.value = 'POP'
    const { rerender } = render(<RootLayout />)

    mockScrollTo.mockClear()
    mockNavigationType.value = 'PUSH'
    rerender(<RootLayout />)

    expect(mockScrollTo).not.toHaveBeenCalled()
  })

  it('uses the current pathname and search as the AsyncBoundary reset key', () => {
    const { rerender } = render(<RootLayout />)

    expect(screen.getByTestId('async-boundary')).toHaveAttribute(
      'data-reset-key',
      '/',
    )

    mockLocationStore.pathname = '/restaurants/restaurant-1'
    mockLocationStore.search = '?tab=review'
    rerender(<RootLayout />)

    expect(screen.getByTestId('async-boundary')).toHaveAttribute(
      'data-reset-key',
      '/restaurants/restaurant-1?tab=review',
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
