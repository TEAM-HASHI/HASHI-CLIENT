import '@testing-library/jest-dom/vitest'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { StrictMode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthSessionRestoreGate } from '@/app/providers/AuthSessionRestoreGate'
import { ROUTES } from '@/app/router/path'
import { getAuthMe } from '@/features/auth/api/getAuthMe'
import { requestTokenReissue } from '@/shared/api/requestTokenReissue'
import {
  clearAuthSession,
  getAccessToken,
  getAuthSessionStatus,
  getAuthSessionVersion,
  setAccessToken,
  startAuthenticatedSession,
  wasAuthSessionExpired,
} from '@/shared/auth/authSession'
import { getApiAccessToken } from '@/shared/api/accessToken'
import { HttpStatusError } from '@/shared/api/apiError'
import { queryClient } from '@/shared/lib/queryClient'
import { getMyProfileSummary } from '@/features/user/api/getMyProfileSummary'
import {
  MY_PROFILE_SUMMARY_QUERY_KEY,
  useMyProfileSummaryQuery,
} from '@/features/user/hooks/useMyProfileSummaryQuery'

vi.mock('@/features/user/api/getMyProfileSummary', () => ({
  getMyProfileSummary: vi.fn(),
}))

vi.mock('@/shared/api/accessToken', () => ({
  getApiAccessToken: vi.fn(),
}))

vi.mock('@/features/auth/api/getAuthMe', () => ({
  getAuthMe: vi.fn(),
}))

vi.mock('@/shared/api/requestTokenReissue', () => ({
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
    vi.unstubAllGlobals()
    mockedRequestTokenReissue.mockReset()
    mockedGetAuthMe.mockReset()
    mockedGetApiAccessToken.mockReset()
    vi.mocked(getMyProfileSummary).mockReset()
    clearAuthSession()
    queryClient.clear()
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
    const previousVersion = getAuthSessionVersion()
    mockedRequestTokenReissue.mockRejectedValue(new HttpStatusError(401))
    mockedGetAuthMe.mockRejectedValue(new HttpStatusError(401))

    render(
      <AuthSessionRestoreGate>
        <div>앱 화면</div>
      </AuthSessionRestoreGate>,
    )

    await waitFor(() => {
      expect(screen.getByText('앱 화면')).toBeInTheDocument()
    })
    expect(getAccessToken()).toBeUndefined()
    expect(wasAuthSessionExpired(previousVersion)).toBe(false)
  })

  it('restores onboarding session from the signup cookie', async () => {
    mockedRequestTokenReissue.mockRejectedValue(new HttpStatusError(401))
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
    expect(mockedGetAuthMe).toHaveBeenCalledWith(undefined)
    expect(getAuthSessionStatus()).toBe('onboarding')
  })

  it.each([
    [ROUTES.hashiPickRestaurants, '하시픽 화면'],
    [ROUTES.popularRestaurants, '인기 식당 화면'],
  ])(
    'renders %s while auth restore runs in the background',
    async (pathname, screenText) => {
      mockedRequestTokenReissue.mockResolvedValue({
        accessToken: 'restored-access-token',
      })
      window.history.pushState({}, '', pathname)

      render(
        <AuthSessionRestoreGate>
          <div>{screenText}</div>
        </AuthSessionRestoreGate>,
      )

      expect(screen.getByText(screenText)).toBeInTheDocument()

      await waitFor(() => {
        expect(getAccessToken()).toBe('restored-access-token')
      })
      expect(mockedRequestTokenReissue).toHaveBeenCalledTimes(1)
    },
  )

  it('rechecks the current route while auth restore is still running', async () => {
    let resolveReissue: (
      value: Awaited<ReturnType<typeof requestTokenReissue>>,
    ) => void = () => {}
    mockedRequestTokenReissue.mockReturnValue(
      new Promise((resolve) => {
        resolveReissue = resolve
      }),
    )

    const { rerender } = render(
      <AuthSessionRestoreGate pathname={ROUTES.hashiPickRestaurants}>
        <div>route screen</div>
      </AuthSessionRestoreGate>,
    )

    expect(screen.getByText('route screen')).toBeInTheDocument()

    rerender(
      <AuthSessionRestoreGate pathname={ROUTES.restaurantDetail}>
        <div>route screen</div>
      </AuthSessionRestoreGate>,
    )

    expect(screen.queryByText('route screen')).not.toBeInTheDocument()

    resolveReissue({ accessToken: 'restored-access-token' })
    await waitFor(() => {
      expect(getAccessToken()).toBe('restored-access-token')
    })
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

  it('restores the cookie session instead of the configured development token', async () => {
    mockedGetApiAccessToken.mockReturnValue('development-token')
    mockedRequestTokenReissue.mockResolvedValue({ accessToken: 'cookie-token' })

    render(
      <AuthSessionRestoreGate>
        <div>앱 화면</div>
      </AuthSessionRestoreGate>,
    )

    await waitFor(() => {
      expect(screen.getByText('앱 화면')).toBeInTheDocument()
    })
    expect(mockedGetAuthMe).toHaveBeenCalledWith('cookie-token')
    expect(mockedRequestTokenReissue).toHaveBeenCalledOnce()
    expect(getAccessToken()).toBe('cookie-token')
  })

  it('retries a temporary restore failure instead of rendering logged-out content', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockedRequestTokenReissue
      .mockRejectedValueOnce(new HttpStatusError(503))
      .mockResolvedValueOnce({ accessToken: 'restored-token' })
    try {
      render(
        <ErrorBoundary
          fallbackRender={({ resetErrorBoundary }) => (
            <button onClick={resetErrorBoundary}>재시도</button>
          )}
        >
          <AuthSessionRestoreGate>
            <div>앱 화면</div>
          </AuthSessionRestoreGate>
        </ErrorBoundary>,
      )
      fireEvent.click(await screen.findByRole('button', { name: '재시도' }))
      await screen.findByText('앱 화면')
      expect(mockedRequestTokenReissue).toHaveBeenCalledTimes(2)
      expect(mockedGetAuthMe).toHaveBeenCalledWith('restored-token')
      expect(getAccessToken()).toBe('restored-token')
    } finally {
      consoleError.mockRestore()
    }
  })

  it('does not overwrite a login completed during background restore', async () => {
    let resolveReissue!: (value: { accessToken: string }) => void
    mockedRequestTokenReissue.mockReturnValue(
      new Promise((resolve) => {
        resolveReissue = resolve
      }),
    )
    render(
      <AuthSessionRestoreGate pathname={ROUTES.popularRestaurants}>
        <div>앱 화면</div>
      </AuthSessionRestoreGate>,
    )
    setAccessToken('new-login-token')
    resolveReissue({ accessToken: 'old-restore-token' })
    await waitFor(() =>
      expect(mockedGetAuthMe).toHaveBeenCalledWith('old-restore-token'),
    )
    expect(getAccessToken()).toBe('new-login-token')
  })

  it.each([undefined, 'cached-access-token'])(
    'revalidates cached session %s without reloading or losing the draft',
    async (token) => {
      const reload = vi.fn()
      vi.stubGlobal('location', { pathname: '/', reload })
      if (token) setAccessToken(token, 1)
      mockedRequestTokenReissue.mockRejectedValue(new HttpStatusError(401))
      mockedGetAuthMe.mockRejectedValue(new HttpStatusError(401))
      const { unmount } = render(
        <AuthSessionRestoreGate>
          <input aria-label="draft" defaultValue="" />
        </AuthSessionRestoreGate>,
      )
      const input = await screen.findByRole('textbox', { name: 'draft' })
      fireEvent.change(input, { target: { value: 'unsaved draft' } })
      mockedRequestTokenReissue.mockClear()
      mockedGetAuthMe.mockResolvedValue({ subjectId: 1, role: 'USER' })
      const previousVersion = getAuthSessionVersion()
      let resolveReissue!: (value: { accessToken: string }) => void
      mockedRequestTokenReissue.mockReturnValue(
        new Promise((resolve) => {
          resolveReissue = resolve
        }),
      )

      fireEvent(
        window,
        new PageTransitionEvent('pageshow', { persisted: false }),
      )
      expect(reload).not.toHaveBeenCalled()
      expect(mockedRequestTokenReissue).not.toHaveBeenCalled()
      fireEvent(
        window,
        new PageTransitionEvent('pageshow', { persisted: true }),
      )
      fireEvent(
        window,
        new PageTransitionEvent('pageshow', { persisted: true }),
      )
      expect(mockedRequestTokenReissue).toHaveBeenCalledOnce()
      await act(async () =>
        resolveReissue({ accessToken: 'fresh-cookie-token' }),
      )
      expect(getAccessToken()).toBe('fresh-cookie-token')
      expect(getAuthSessionVersion()).toBe(previousVersion + (token ? 0 : 1))
      expect(screen.getByRole('textbox', { name: 'draft' })).toBe(input)
      expect(input).toHaveValue('unsaved draft')
      expect(reload).not.toHaveBeenCalled()

      unmount()
      fireEvent(
        window,
        new PageTransitionEvent('pageshow', { persisted: true }),
      )
      expect(mockedRequestTokenReissue).toHaveBeenCalledOnce()
    },
  )

  it.each([1, 2])(
    'revalidates user %s without mixing the previous account cache',
    async (subjectId) => {
      startAuthenticatedSession('account-a-token', 1)
      const previousVersion = getAuthSessionVersion()
      queryClient.setQueryData(MY_PROFILE_SUMMARY_QUERY_KEY, {
        nickname: 'account-a',
      })
      const requestedTokens: (string | undefined)[] = []
      vi.mocked(getMyProfileSummary).mockImplementation(async () => {
        requestedTokens.push(getAccessToken())
        return { nickname: 'account-b' }
      })
      const Profile = () => {
        const profile = useMyProfileSummaryQuery()
        return (
          <>
            <span>{profile.data?.nickname}</span>
            <input aria-label="draft" defaultValue="unsaved" />
          </>
        )
      }
      const aborted = vi.fn()
      let resolveProfile!: (value: string) => void
      const pending = queryClient
        .fetchQuery({
          queryKey: ['pending-profile'],
          queryFn: ({ signal }) => {
            signal.addEventListener('abort', aborted)
            return new Promise<string>((resolve) => {
              resolveProfile = resolve
            })
          },
        })
        .catch(() => undefined)
      mockedRequestTokenReissue.mockResolvedValue({
        accessToken: 'restored-token',
      })
      mockedGetAuthMe.mockResolvedValue({ role: 'USER', subjectId })
      render(
        <QueryClientProvider client={queryClient}>
          <AuthSessionRestoreGate>
            <Profile />
          </AuthSessionRestoreGate>
        </QueryClientProvider>,
      )
      expect(screen.getByText('account-a')).toBeInTheDocument()
      const input = screen.getByRole('textbox', { name: 'draft' })
      await act(async () => {
        fireEvent(
          window,
          new PageTransitionEvent('pageshow', { persisted: true }),
        )
      })
      expect(getAccessToken()).toBe('restored-token')
      expect(getAuthSessionVersion()).toBe(
        previousVersion + (subjectId === 2 ? 1 : 0),
      )
      await screen.findByText(subjectId === 2 ? 'account-b' : 'account-a')
      expect(queryClient.getQueryData(MY_PROFILE_SUMMARY_QUERY_KEY)).toEqual({
        nickname: subjectId === 2 ? 'account-b' : 'account-a',
      })
      expect(requestedTokens).toEqual(subjectId === 2 ? ['restored-token'] : [])
      expect(aborted).toHaveBeenCalledTimes(subjectId === 2 ? 1 : 0)
      resolveProfile('late-account-a-profile')
      await pending
      expect(queryClient.getQueryData(['pending-profile'])).toBe(
        subjectId === 2 ? undefined : 'late-account-a-profile',
      )
      expect(screen.getByRole('textbox', { name: 'draft' })).toBe(input)
      expect(input).toHaveValue('unsaved')
    },
  )

  it.each([401, 503])(
    'handles a %s BFCache recheck without unmounting the draft',
    async (status) => {
      setAccessToken('cached-token')
      const previousVersion = getAuthSessionVersion()
      mockedRequestTokenReissue.mockRejectedValue(new HttpStatusError(status))
      mockedGetAuthMe.mockRejectedValue(new HttpStatusError(401))
      render(
        <AuthSessionRestoreGate>
          <input aria-label="draft" defaultValue="unsaved" />
        </AuthSessionRestoreGate>,
      )
      const input = screen.getByRole('textbox', { name: 'draft' })
      await act(async () => {
        fireEvent(
          window,
          new PageTransitionEvent('pageshow', { persisted: true }),
        )
      })
      expect(getAccessToken()).toBe(status === 401 ? undefined : 'cached-token')
      expect(wasAuthSessionExpired(previousVersion)).toBe(status === 401)
      expect(screen.getByRole('textbox', { name: 'draft' })).toBe(input)
      expect(input).toHaveValue('unsaved')
    },
  )

  it.each(['login', 'logout', 'refresh'])(
    'ignores a late BFCache response after %s',
    async (action) => {
      setAccessToken('cached-token')
      let resolveReissue!: (value: { accessToken: string }) => void
      mockedRequestTokenReissue.mockReturnValue(
        new Promise((resolve) => {
          resolveReissue = resolve
        }),
      )
      render(
        <AuthSessionRestoreGate>
          <div>앱 화면</div>
        </AuthSessionRestoreGate>,
      )
      fireEvent(
        window,
        new PageTransitionEvent('pageshow', { persisted: true }),
      )
      expect(resolveReissue).toBeTypeOf('function')
      act(() => {
        if (action === 'login') startAuthenticatedSession('new-login')
        else if (action === 'logout') clearAuthSession()
        else setAccessToken('new-refresh')
      })
      await act(async () => resolveReissue({ accessToken: 'stale-token' }))
      expect(getAccessToken()).toBe(
        action === 'logout'
          ? undefined
          : action === 'login'
            ? 'new-login'
            : 'new-refresh',
      )
    },
  )

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
