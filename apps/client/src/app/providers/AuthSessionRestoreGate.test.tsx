import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthSessionRestoreGate } from '@/app/providers/AuthSessionRestoreGate'
import { ROUTES } from '@/app/router/path'
import { getAuthMe } from '@/features/auth/api/getAuthMe'
import { requestTokenReissue } from '@/features/auth/api/reissueToken'
import {
  clearAuthSession,
  getAccessToken,
  getAuthSessionStatus,
  setAccessToken,
} from '@/features/auth/session/authSession'
import { getApiAccessToken } from '@/shared/api/accessToken'

vi.mock('@/shared/api/accessToken', () => ({
  getApiAccessToken: vi.fn(),
}))

vi.mock('@/features/auth/api/getAuthMe', () => ({
  getAuthMe: vi.fn(),
}))

vi.mock('@/features/auth/api/reissueToken', () => ({
  requestTokenReissue: vi.fn(),
}))

const mockedRequestTokenReissue = vi.mocked(requestTokenReissue)
const mockedGetAuthMe = vi.mocked(getAuthMe)
const mockedGetApiAccessToken = vi.mocked(getApiAccessToken)

describe('AuthSessionRestoreGate', () => {
  beforeEach(() => {
    mockedGetApiAccessToken.mockReturnValue(null)
    mockedGetAuthMe.mockResolvedValue({
      subjectId: 1,
      role: 'USER',
    })
  })

  afterEach(() => {
    cleanup()
    mockedRequestTokenReissue.mockReset()
    mockedGetAuthMe.mockReset()
    mockedGetApiAccessToken.mockReset()
    clearAuthSession()
    window.history.pushState({}, '', '/')
  })

  it('restores access token before rendering children', async () => {
    mockedRequestTokenReissue.mockResolvedValue({
      accessToken: 'restored-access-token',
    })

    render(
      <AuthSessionRestoreGate>
        <div>앱 화면</div>
      </AuthSessionRestoreGate>,
    )

    expect(screen.queryByText('앱 화면')).not.toBeInTheDocument()
    expect(
      screen.queryByText('로그인 상태를 확인하고 있어요'),
    ).not.toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('앱 화면')).toBeInTheDocument()
    })
    expect(mockedRequestTokenReissue).toHaveBeenCalledTimes(1)
    expect(mockedGetAuthMe).toHaveBeenCalledWith('restored-access-token')
    expect(getAccessToken()).toBe('restored-access-token')
  })

  it('renders children as unauthenticated when token restore fails', async () => {
    mockedRequestTokenReissue.mockRejectedValue(new Error('No refresh token.'))
    mockedGetAuthMe.mockRejectedValue(new Error('No signup token.'))

    render(
      <AuthSessionRestoreGate>
        <div>앱 화면</div>
      </AuthSessionRestoreGate>,
    )

    await waitFor(() => {
      expect(screen.getByText('앱 화면')).toBeInTheDocument()
    })
    expect(getAccessToken()).toBeUndefined()
  })

  it('restores onboarding session from the signup cookie', async () => {
    mockedRequestTokenReissue.mockRejectedValue(new Error('No refresh token.'))
    mockedGetAuthMe.mockResolvedValue({
      role: 'ONBOARDING',
    })

    render(
      <AuthSessionRestoreGate>
        <div>프로필 생성 화면</div>
      </AuthSessionRestoreGate>,
    )

    await waitFor(() => {
      expect(screen.getByText('프로필 생성 화면')).toBeInTheDocument()
    })
    expect(mockedGetAuthMe).toHaveBeenCalledWith()
    expect(getAuthSessionStatus()).toBe('onboarding')
  })

  it('renders public restaurant list routes while auth restore runs in the background', async () => {
    mockedRequestTokenReissue.mockResolvedValue({
      accessToken: 'restored-access-token',
    })
    window.history.pushState({}, '', ROUTES.hashiPickRestaurants)

    render(
      <AuthSessionRestoreGate>
        <div>하시픽 화면</div>
      </AuthSessionRestoreGate>,
    )

    expect(screen.getByText('하시픽 화면')).toBeInTheDocument()
    expect(
      screen.queryByText('로그인 상태를 확인하고 있어요'),
    ).not.toBeInTheDocument()

    await waitFor(() => {
      expect(getAccessToken()).toBe('restored-access-token')
    })
    expect(mockedRequestTokenReissue).toHaveBeenCalledTimes(1)
  })

  it('does not authenticate an admin session in the user client', async () => {
    mockedRequestTokenReissue.mockResolvedValue({
      accessToken: 'admin-access-token',
    })
    mockedGetAuthMe.mockResolvedValue({
      subjectId: 1,
      role: 'ADMIN',
    })

    render(
      <AuthSessionRestoreGate>
        <div>앱 화면</div>
      </AuthSessionRestoreGate>,
    )

    await waitFor(() => {
      expect(screen.getByText('앱 화면')).toBeInTheDocument()
    })
    expect(getAuthSessionStatus()).toBe('unauthenticated')
    expect(getAccessToken()).toBeUndefined()
  })

  it('does not reissue when access token already exists in memory', async () => {
    setAccessToken('existing-access-token')

    render(
      <AuthSessionRestoreGate>
        <div>앱 화면</div>
      </AuthSessionRestoreGate>,
    )

    expect(screen.getByText('앱 화면')).toBeInTheDocument()
    expect(mockedRequestTokenReissue).not.toHaveBeenCalled()
    expect(getAccessToken()).toBe('existing-access-token')
  })

  it('restores the local development token without a reissue request', async () => {
    mockedGetApiAccessToken.mockReturnValue('development-token')

    render(
      <AuthSessionRestoreGate>
        <div>앱 화면</div>
      </AuthSessionRestoreGate>,
    )

    await waitFor(() => {
      expect(screen.getByText('앱 화면')).toBeInTheDocument()
    })
    expect(mockedGetAuthMe).toHaveBeenCalledWith('development-token')
    expect(mockedRequestTokenReissue).not.toHaveBeenCalled()
    expect(getAccessToken()).toBe('development-token')
  })

  it('shares one restore request across StrictMode remounts', async () => {
    mockedRequestTokenReissue.mockResolvedValue({
      accessToken: 'restored-access-token',
    })

    render(
      <StrictMode>
        <AuthSessionRestoreGate>
          <div>앱 화면</div>
        </AuthSessionRestoreGate>
      </StrictMode>,
    )

    await waitFor(() => {
      expect(screen.getByText('앱 화면')).toBeInTheDocument()
    })
    expect(mockedRequestTokenReissue).toHaveBeenCalledTimes(1)
    expect(getAccessToken()).toBe('restored-access-token')
  })
})
