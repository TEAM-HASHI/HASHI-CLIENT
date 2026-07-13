import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getApiAccessToken } from '@/shared/api/accessToken'

describe('API access token', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('ignores persisted tokens and returns only the development fallback', () => {
    vi.stubEnv('VITE_DEV_USER_ACCESS_TOKEN', 'development-token')
    window.localStorage.setItem('accessToken', 'stored-token')

    expect(getApiAccessToken()).toBe('development-token')
  })

  it('returns the local development token when no stored token exists', () => {
    vi.stubEnv('VITE_DEV_USER_ACCESS_TOKEN', 'development-token')

    expect(getApiAccessToken()).toBe('development-token')
  })

  it('returns null when no token exists', () => {
    vi.stubEnv('VITE_DEV_USER_ACCESS_TOKEN', '')

    expect(getApiAccessToken()).toBeNull()
  })
})
