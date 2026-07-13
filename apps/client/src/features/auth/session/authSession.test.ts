import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  clearAuthSession,
  getAccessToken,
  getAuthSessionStatus,
  setAccessToken,
  setOnboardingSession,
  subscribeAuthSession,
} from '@/features/auth/session/authSession'

describe('authSession', () => {
  afterEach(() => {
    clearAuthSession()
  })

  it('starts unauthenticated', () => {
    expect(getAccessToken()).toBeUndefined()
    expect(getAuthSessionStatus()).toBe('unauthenticated')
  })

  it('stores access token in memory and marks session authenticated', () => {
    setAccessToken('access-token')

    expect(getAccessToken()).toBe('access-token')
    expect(getAuthSessionStatus()).toBe('authenticated')
  })

  it('marks onboarding session without storing an access token', () => {
    setOnboardingSession()

    expect(getAccessToken()).toBeUndefined()
    expect(getAuthSessionStatus()).toBe('onboarding')
  })

  it('notifies subscribers when auth session changes', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeAuthSession(listener)

    setAccessToken('access-token')
    setOnboardingSession()
    clearAuthSession()

    expect(listener).toHaveBeenCalledTimes(3)

    unsubscribe()
    setAccessToken('new-access-token')

    expect(listener).toHaveBeenCalledTimes(3)
  })
})
