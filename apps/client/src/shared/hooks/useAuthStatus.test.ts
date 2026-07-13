import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import {
  clearAuthSession,
  setAccessToken,
  setOnboardingSession,
} from '@/features/auth/session/authSession'
import { useAuthStatus } from '@/shared/hooks/useAuthStatus'

describe('useAuthStatus', () => {
  afterEach(() => {
    clearAuthSession()
  })

  it('returns unauthenticated before OAuth session is established', () => {
    const { result } = renderHook(() => useAuthStatus())

    expect(result.current).toEqual({
      isAuthenticated: false,
      isOnboarding: false,
      status: 'unauthenticated',
    })
  })

  it('returns authenticated when access token exists in memory', () => {
    setAccessToken('access-token')

    const { result } = renderHook(() => useAuthStatus())

    expect(result.current).toEqual({
      isAuthenticated: true,
      isOnboarding: false,
      status: 'authenticated',
    })
  })

  it('returns onboarding when new user onboarding session exists', () => {
    setOnboardingSession()

    const { result } = renderHook(() => useAuthStatus())

    expect(result.current).toEqual({
      isAuthenticated: false,
      isOnboarding: true,
      status: 'onboarding',
    })
  })
})
