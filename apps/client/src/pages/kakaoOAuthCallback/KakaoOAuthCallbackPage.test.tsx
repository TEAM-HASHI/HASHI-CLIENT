import '@testing-library/jest-dom/vitest'
import { StrictMode } from 'react'
import { act, cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'
import { getAuthMe } from '@/features/auth/api/getAuthMe'
import { requestKakaoLogin } from '@/features/auth/api/kakaoLogin'
import {
  clearAuthSession,
  getAccessToken,
  startAuthenticatedSession,
  setOnboardingSession,
} from '@/shared/auth/authSession'
import { consumeKakaoOAuthState } from '@/features/auth/utils/kakaoOAuth'

import { KakaoOAuthCallbackPage } from '@/pages/kakaoOAuthCallback/KakaoOAuthCallbackPage'

const { mockNavigate, mockSearch } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockSearch: {
    value: '',
  },
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(mockSearch.value)],
  }
})

vi.mock('@/features/auth/api/getAuthMe', () => ({
  getAuthMe: vi.fn(),
}))

vi.mock('@/features/auth/api/kakaoLogin', () => ({
  requestKakaoLogin: vi.fn(),
}))

vi.mock('@/shared/auth/authSession', async () => {
  const actual = await vi.importActual<
    typeof import('@/shared/auth/authSession')
  >('@/shared/auth/authSession')
  return {
    ...actual,
    clearAuthSession: vi.fn(actual.clearAuthSession),
    startAuthenticatedSession: vi.fn(actual.startAuthenticatedSession),
    setOnboardingSession: vi.fn(actual.setOnboardingSession),
  }
})

vi.mock('@/features/auth/utils/kakaoOAuth', () => ({
  consumeKakaoOAuthState: vi.fn(),
}))

const mockedConsumeKakaoOAuthState = vi.mocked(consumeKakaoOAuthState)
const mockedRequestKakaoLogin = vi.mocked(requestKakaoLogin)
const mockedGetAuthMe = vi.mocked(getAuthMe)
const mockedClearAuthSession = vi.mocked(clearAuthSession)
const mockedSetAccessToken = vi.mocked(startAuthenticatedSession)
const mockedSetOnboardingSession = vi.mocked(setOnboardingSession)

describe('KakaoOAuthCallbackPage', () => {
  beforeEach(() => {
    clearAuthSession()
    vi.clearAllMocks()
    mockSearch.value = '?code=kakao-code&state=state-123'
    mockedConsumeKakaoOAuthState.mockReturnValue({
      state: 'state-123',
      createdAt: 1,
      redirectTo: '/my-reservations',
    })
    mockedRequestKakaoLogin.mockResolvedValue({
      registered: true,
      accessToken: 'access-token',
    })
    mockedGetAuthMe.mockResolvedValue({
      subjectId: 1,
      role: 'USER',
    })
  })

  afterEach(() => {
    cleanup()
    clearAuthSession()
    vi.clearAllMocks()
  })

  it('redirects to login-required when authorization code is missing', async () => {
    mockSearch.value = '?state=state-123'

    render(<KakaoOAuthCallbackPage />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.loginRequired, {
        replace: true,
      })
    })
    expect(mockedRequestKakaoLogin).not.toHaveBeenCalled()
  })

  it('redirects to login-required when OAuth state is invalid', async () => {
    mockedConsumeKakaoOAuthState.mockReturnValue(undefined)

    render(<KakaoOAuthCallbackPage />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.loginRequired, {
        replace: true,
      })
    })
    expect(mockedRequestKakaoLogin).not.toHaveBeenCalled()
  })

  it('stores access token, checks auth subject, and redirects existing user', async () => {
    render(<KakaoOAuthCallbackPage />)

    await waitFor(() => {
      expect(mockedSetAccessToken).toHaveBeenCalledWith('access-token')
    })
    expect(mockedRequestKakaoLogin).toHaveBeenCalledWith('kakao-code')
    expect(mockedGetAuthMe).toHaveBeenCalledWith('access-token')
    expect(mockedGetAuthMe.mock.invocationCallOrder[0]).toBeLessThan(
      mockedSetAccessToken.mock.invocationCallOrder[0],
    )
    expect(mockNavigate).toHaveBeenCalledWith('/my-reservations', {
      replace: true,
    })
  })

  it('clears session and redirects when auth subject check fails', async () => {
    mockedGetAuthMe.mockRejectedValue(new Error('Invalid auth subject.'))

    render(<KakaoOAuthCallbackPage />)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.loginRequired, {
        replace: true,
      })
    })
    expect(mockedSetAccessToken).not.toHaveBeenCalled()
    expect(mockedClearAuthSession).toHaveBeenCalled()
  })

  it('rejects a non-user auth subject response', async () => {
    mockedGetAuthMe.mockResolvedValue({
      subjectId: 1,
      role: 'ADMIN',
    })

    render(<KakaoOAuthCallbackPage />)

    await waitFor(() => {
      expect(mockedClearAuthSession).toHaveBeenCalled()
    })
    expect(mockedSetAccessToken).not.toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.loginRequired, {
      replace: true,
    })
  })

  it('starts onboarding session and redirects new user to profile creation', async () => {
    mockedConsumeKakaoOAuthState.mockReturnValue({
      state: 'state-123',
      createdAt: 1,
      redirectTo: '/restaurants/1/reservations/new',
    })
    mockedRequestKakaoLogin.mockResolvedValue({
      registered: false,
      accessToken: undefined,
    })

    render(<KakaoOAuthCallbackPage />)

    await waitFor(() => {
      expect(mockedSetOnboardingSession).toHaveBeenCalled()
    })
    expect(mockNavigate).toHaveBeenCalledWith(
      `${ROUTES.profileNew}?redirectTo=%2Frestaurants%2F1%2Freservations%2Fnew`,
      { replace: true },
    )
  })

  it('handles callback only once under StrictMode', async () => {
    render(
      <StrictMode>
        <KakaoOAuthCallbackPage />
      </StrictMode>,
    )

    await waitFor(() => {
      expect(mockedSetAccessToken).toHaveBeenCalledWith('access-token')
    })
    expect(mockedRequestKakaoLogin).toHaveBeenCalledTimes(1)
  })

  it.each(['member', 'onboarding', 'failure'] as const)(
    'ignores a late %s login response after leaving the callback page',
    async (outcome) => {
      let resolveLogin!: (
        value: Awaited<ReturnType<typeof requestKakaoLogin>>,
      ) => void
      let rejectLogin!: (cause: Error) => void
      mockedRequestKakaoLogin.mockImplementationOnce(
        () =>
          new Promise((resolve, reject) => {
            resolveLogin = resolve
            rejectLogin = reject
          }),
      )
      const { unmount } = render(<KakaoOAuthCallbackPage />)
      unmount()
      await act(async () => {
        if (outcome === 'failure') rejectLogin(new Error('late failure'))
        else
          resolveLogin({
            registered: outcome === 'member',
            accessToken: 'late-token',
          })
      })
      expect(mockedSetAccessToken).not.toHaveBeenCalled()
      expect(mockedSetOnboardingSession).not.toHaveBeenCalled()
      expect(mockedClearAuthSession).not.toHaveBeenCalled()
      expect(mockNavigate).not.toHaveBeenCalled()
    },
  )

  it.each([
    ['login', 'success'],
    ['login', 'failure'],
    ['logout', 'success'],
    ['logout', 'failure'],
  ] as const)(
    'ignores a late auth check %s/%s after the session changes',
    async (sessionChange, outcome) => {
      let resolveAuth!: (value: Awaited<ReturnType<typeof getAuthMe>>) => void
      let rejectAuth!: (cause: Error) => void
      mockedGetAuthMe.mockImplementationOnce(
        () =>
          new Promise((resolve, reject) => {
            resolveAuth = resolve
            rejectAuth = reject
          }),
      )
      render(<KakaoOAuthCallbackPage />)
      await waitFor(() => expect(mockedGetAuthMe).toHaveBeenCalledOnce())
      if (sessionChange === 'login')
        startAuthenticatedSession('new-session-token')
      else clearAuthSession()
      vi.clearAllMocks()
      await act(async () => {
        if (outcome === 'failure') rejectAuth(new Error('late failure'))
        else resolveAuth({ role: 'USER', subjectId: 1 })
      })
      expect(getAccessToken()).toBe(
        sessionChange === 'login' ? 'new-session-token' : undefined,
      )
      expect(mockedSetAccessToken).not.toHaveBeenCalled()
      expect(mockedClearAuthSession).not.toHaveBeenCalled()
      expect(mockNavigate).not.toHaveBeenCalled()
    },
  )
})
