import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  clearApiAccessToken,
  getApiAccessToken,
  setApiAccessToken,
} from '@/shared/api/accessToken'

describe('API access token', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    clearApiAccessToken()
    window.localStorage.clear()
    vi.unstubAllEnvs()
  })

  it('returns the stored token before the development fallback', () => {
    vi.stubEnv('VITE_DEV_USER_ACCESS_TOKEN', 'development-token')
    window.localStorage.setItem('accessToken', 'stored-token')

    expect(getApiAccessToken()).toBe('stored-token')
  })

  it('persists the token for authenticated API requests', () => {
    setApiAccessToken('stored-token')

    expect(window.localStorage.getItem('accessToken')).toBe('stored-token')
  })

  it('removes the persisted token when authentication is cleared', () => {
    window.localStorage.setItem('accessToken', 'stored-token')

    clearApiAccessToken()

    expect(window.localStorage.getItem('accessToken')).toBeNull()
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
