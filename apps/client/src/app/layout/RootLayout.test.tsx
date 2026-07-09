import '@testing-library/jest-dom/vitest'

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { RootLayout } from '@/app/layout/RootLayout'

const { mockToastRegion } = vi.hoisted(() => ({
  mockToastRegion: vi.fn(({ className }: { className?: string }) => (
    <div data-testid="toast-region" data-class-name={className} />
  )),
}))

vi.mock('@hashi/hds-ui', () => ({
  ToastRegion: mockToastRegion,
}))

vi.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="route-outlet" />,
}))

describe('RootLayout', () => {
  afterEach(() => {
    cleanup()
    mockToastRegion.mockClear()
  })

  it('positions the toast region at the top of the mobile frame with 20px horizontal padding', () => {
    render(<RootLayout />)

    expect(screen.getByTestId('toast-region')).toHaveAttribute(
      'data-class-name',
      'z-toast fixed inset-x-0 top-0 mx-auto w-full max-w-[var(--app-mobile-max-width,100%)] px-5 pt-[calc(32px+var(--safe-area-top,0px))]',
    )
  })
})
