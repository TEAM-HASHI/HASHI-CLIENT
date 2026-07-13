import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AuthSessionRestoreGate } from '@/app/providers/AuthSessionRestoreGate'
import { requestTokenReissue } from '@/features/auth/api/reissueToken'
import {
  clearAuthSession,
  getAccessToken,
  setAccessToken,
} from '@/features/auth/session/authSession'

vi.mock('@/features/auth/api/reissueToken', () => ({
  requestTokenReissue: vi.fn(),
}))

const mockedRequestTokenReissue = vi.mocked(requestTokenReissue)

describe('AuthSessionRestoreGate', () => {
  afterEach(() => {
    cleanup()
    mockedRequestTokenReissue.mockReset()
    clearAuthSession()
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

    await waitFor(() => {
      expect(screen.getByText('앱 화면')).toBeInTheDocument()
    })
    expect(mockedRequestTokenReissue).toHaveBeenCalledTimes(1)
    expect(getAccessToken()).toBe('restored-access-token')
  })

  it('renders children as unauthenticated when token restore fails', async () => {
    mockedRequestTokenReissue.mockRejectedValue(new Error('No refresh token.'))

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
