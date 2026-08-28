import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  initAnalytics,
  isAnalyticsEnabled,
  trackPageView,
} from '@/shared/lib/analytics'

const expectGtagCommand = (
  command: IArguments | undefined,
  expected: unknown[],
) => {
  expect(command).toBeDefined()
  expect(Object.prototype.toString.call(command)).toBe('[object Arguments]')
  expect(Array.from(command ?? [])).toEqual(expected)
}

describe('analytics', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    delete window.dataLayer
    delete window.gtag
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    document.head.innerHTML = ''
    delete window.dataLayer
    delete window.gtag
  })

  it('disables analytics when measurement id is missing', () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', '')

    expect(isAnalyticsEnabled()).toBe(false)
  })

  it('installs Google Analytics script and initializes gtag when measurement id exists', () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TEST123')

    expect(isAnalyticsEnabled()).toBe(true)

    initAnalytics()

    expect(
      document.querySelector(
        'script[src="https://www.googletagmanager.com/gtag/js?id=G-TEST123"]',
      ),
    ).toBeInTheDocument()
    expectGtagCommand(window.dataLayer?.[0], ['js', expect.any(Date)])
    expectGtagCommand(window.dataLayer?.[1], [
      'config',
      'G-TEST123',
      { send_page_view: false },
    ])
  })

  it('tracks page view only when gtag is initialized', () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TEST123')

    trackPageView('/restaurants/1?tab=review')
    expect(window.gtag).toBeUndefined()

    initAnalytics()
    trackPageView('/restaurants/1?tab=review')

    expectGtagCommand(window.dataLayer?.at(-1), [
      'event',
      'page_view',
      {
        page_location: 'http://localhost:3000/restaurants/1?tab=review',
        page_path: '/restaurants/1?tab=review',
      },
    ])
  })
})
