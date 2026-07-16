import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  initAnalytics,
  isAnalyticsEnabled,
  trackPageView,
} from '@/shared/lib/analytics'

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
    expect(window.dataLayer).toEqual([
      ['js', expect.any(Date)],
      ['config', 'G-TEST123', { send_page_view: false }],
    ])
  })

  it('tracks page view only when gtag is initialized', () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TEST123')

    trackPageView('/restaurants/1?tab=review')
    expect(window.gtag).toBeUndefined()

    initAnalytics()
    trackPageView('/restaurants/1?tab=review')

    expect(window.dataLayer?.at(-1)).toEqual([
      'event',
      'page_view',
      {
        page_location: 'http://localhost:3000/restaurants/1?tab=review',
        page_path: '/restaurants/1?tab=review',
      },
    ])
  })
})
