import '@testing-library/jest-dom/vitest'
import { StrictMode } from 'react'
import { cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/router/path'
import { getAuthMe } from '@/features/auth/api/getAuthMe'
import { requestKakaoLogin } from '@/features/auth/api/kakaoLogin'
import {
  clearAuthSession,
  setAccessToken,
  setOnboardingSession,
} from '@/features/auth/session/authSession'
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

vi.mock('@/features/auth/session/authSession', () => ({
  clearAuthSession: vi.fn(),
  setAccessToken: vi.fn(),
  setOnboardingSession: vi.fn(),
}))

vi.mock('@/features/auth/utils/kakaoOAuth', () => ({
  consumeKakaoOAuthState: vi.fn(),
}))

const mockedConsumeKakaoOAuthState = vi.mocked(consumeKakaoOAuthState)
const mockedRequestKakaoLogin = vi.mocked(requestKakaoLogin)
const mockedGetAuthMe = vi.mocked(getAuthMe)
const mockedClearAuthSession = vi.mocked(clearAuthSession)
const mockedSetAccessToken = vi.mocked(setAccessToken)
const mockedSetOnboardingSession = vi.mocked(setOnboardingSession)

describe('KakaoOAuthCallbackPage', () => {
  beforeEach(() => {
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
      expect(mockedRequestKakaoLogin).toHaveBeenCalledTimes(1)
    })
  })
})
