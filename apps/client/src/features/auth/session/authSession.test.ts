import { afterEach, describe, expect, it } from 'vitest'

import {
  clearAuthSession,
  getAccessToken,
  getAuthSessionStatus,
  setAccessToken,
  setOnboardingSession,
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
})
