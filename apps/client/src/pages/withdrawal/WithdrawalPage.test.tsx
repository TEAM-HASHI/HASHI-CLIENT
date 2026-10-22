import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { showToast } from '@hashi/hds-ui'

import { WithdrawalPage } from '@/pages/withdrawal/WithdrawalPage'
import { apiClient } from '@/shared/api/apiClient'
import { requestTokenReissue } from '@/shared/api/requestTokenReissue'
import { HttpStatusError } from '@/shared/api/apiError'
import {
  clearAuthSession,
  getAccessToken,
  setOnboardingSession,
  startAuthenticatedSession,
} from '@/shared/auth/authSession'

vi.mock('@/shared/api/apiClient', () => ({ apiClient: vi.fn() }))
vi.mock('@/shared/api/requestTokenReissue', () => ({
  requestTokenReissue: vi.fn(),
}))
vi.mock('@hashi/hds-ui', async (original) => ({
  ...(await original<typeof import('@hashi/hds-ui')>()),
  showToast: vi.fn(),
}))

const response = (status = 200, code = 'USER-204', message = code) =>
  new Response(
    JSON.stringify({
      success: status < 400,
      code,
      message,
      data: null,
      ...(status >= 400
        ? { timestamp: '2026-10-17', path: '/api/v1/users/me' }
        : {}),
    }),
    { status },
  )

const setup = () => {
  startAuthenticatedSession('access-token')
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  client.setQueryData(['my-profile'], { nickname: '기존 사용자' })
  const router = createMemoryRouter(
    [
      { path: '/withdrawal', element: <WithdrawalPage /> },
      { path: '/mypage', element: <div>마이페이지</div> },
      { path: '/login-required', element: <div>로그인</div> },
    ],
    { initialEntries: ['/mypage', '/withdrawal'] },
  )
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { client, router }
}

afterEach(() => {
  cleanup()
  clearAuthSession()
  vi.resetAllMocks()
})

describe('회원탈퇴 요청 흐름', () => {
  it('blocks duplicate requests and navigation, preserves consent after rejection, and clears the session on retry success', async () => {
    let resolve!: (value: Response) => void
    vi.mocked(apiClient).mockImplementationOnce(
      () =>
        new Promise<Response>((done) => {
          resolve = done
        }) as never,
    )
    const { client, router } = setup()
    const submit = screen.getByRole('button', { name: '탈퇴하기' })
    fireEvent.click(submit)
    expect(apiClient).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('checkbox'))
    act(() => {
      fireEvent.click(submit)
      fireEvent.click(submit)
    })
    await waitFor(() => expect(apiClient).toHaveBeenCalledOnce())
    expect(screen.getByRole('checkbox')).toBeDisabled()
    expect(screen.getByRole('button', { name: '뒤로가기' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '돌아가기' })).toBeDisabled()
    await act(async () => {
      await router.navigate(-1)
    })
    expect(router.state.location.pathname).toBe('/withdrawal')
    await act(async () => {
      resolve(response(409, 'RESERVATION-008', '예약을 마친 뒤 탈퇴해주세요.'))
    })
    await waitFor(() => expect(submit).toBeEnabled())
    expect(screen.getByRole('checkbox')).toBeChecked()
    expect(getAccessToken()).toBe('access-token')
    expect(client.getQueryData(['my-profile'])).toBeDefined()
    expect(showToast).toHaveBeenCalledWith({
      children: '예약을 마친 뒤 탈퇴해주세요.',
    })
    vi.mocked(apiClient).mockResolvedValueOnce(response())
    fireEvent.click(submit)
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/login-required'),
    )
    expect(apiClient).toHaveBeenLastCalledWith(
      'api/v1/users/me',
      expect.objectContaining({
        method: 'delete',
        credentials: 'include',
        headers: expect.any(Headers),
      }),
    )
    expect(getAccessToken()).toBeUndefined()
    expect(client.getQueryCache().getAll()).toHaveLength(0)
    expect(showToast).toHaveBeenCalledTimes(1)
  })

  it('finishes a pending withdrawal after its own session expires', async () => {
    let resolve!: (value: Response) => void
    vi.mocked(apiClient).mockImplementationOnce(
      () =>
        new Promise<Response>((done) => {
          resolve = done
        }) as never,
    )
    const { client, router } = setup()
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: '탈퇴하기' }))
    await waitFor(() => expect(apiClient).toHaveBeenCalledOnce())
    await act(async () => {
      clearAuthSession('expired')
      resolve(response())
    })
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/login-required'),
    )
    expect(getAccessToken()).toBeUndefined()
    expect(client.getQueryCache().getAll()).toHaveLength(0)
    expect(showToast).not.toHaveBeenCalled()
  })

  it.each([
    [404, 'USER-005'],
    [401, 'AUTH-001'],
  ] as const)(
    'cleans up an absent or expired account (%s %s) without an error toast',
    async (status, code) => {
      vi.mocked(apiClient).mockResolvedValue(response(status, code))
      vi.mocked(requestTokenReissue).mockRejectedValue(new HttpStatusError(401))
      const { client, router } = setup()
      fireEvent.click(screen.getByRole('checkbox'))
      fireEvent.click(screen.getByRole('button', { name: '탈퇴하기' }))
      await waitFor(() =>
        expect(router.state.location.pathname).toBe('/login-required'),
      )
      expect(getAccessToken()).toBeUndefined()
      expect(client.getQueryCache().getAll()).toHaveLength(0)
      expect(showToast).not.toHaveBeenCalled()
    },
  )

  it.each([response(500, 'COMMON-500'), response(404, 'COMMON-404')])(
    'preserves consent and account data on a non-terminal failure',
    async (failure) => {
      vi.mocked(apiClient).mockResolvedValueOnce(failure)
      const { client, router } = setup()
      fireEvent.click(screen.getByRole('checkbox'))
      fireEvent.click(screen.getByRole('button', { name: '탈퇴하기' }))
      await waitFor(() => expect(showToast).toHaveBeenCalledOnce())
      expect(router.state.location.pathname).toBe('/withdrawal')
      expect(screen.getByRole('checkbox')).toBeChecked()
      expect(getAccessToken()).toBe('access-token')
      expect(client.getQueryData(['my-profile'])).toBeDefined()
      expect(apiClient).toHaveBeenCalledOnce()
    },
  )

  it('does not send withdrawal if the account changes before request dispatch', async () => {
    const { client, router } = setup()
    fireEvent.click(screen.getByRole('checkbox'))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '탈퇴하기' }))
      startAuthenticatedSession('new-session')
    })
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '탈퇴하기' })).toBeEnabled(),
    )
    expect(apiClient).not.toHaveBeenCalled()
    expect(getAccessToken()).toBe('new-session')
    expect(client.getQueryData(['my-profile'])).toBeDefined()
    expect(router.state.location.pathname).toBe('/withdrawal')
  })

  it.each([
    ['authenticated', 200],
    ['onboarding', 200],
    ['logged-out', 200],
    ['changed-then-logged-out', 200],
    ['changed-then-logged-out', 401],
    ['changed-then-logged-out', 409],
    ['changed-then-expired', 200],
  ] as const)(
    'ignores an older withdrawal response after %s (%s)',
    async (status, responseStatus) => {
      let resolve!: (value: Response) => void
      vi.mocked(apiClient).mockImplementationOnce(
        () =>
          new Promise<Response>((done) => {
            resolve = done
          }) as never,
      )
      const { client, router } = setup()
      fireEvent.click(screen.getByRole('checkbox'))
      fireEvent.click(screen.getByRole('button', { name: '탈퇴하기' }))
      await waitFor(() => expect(apiClient).toHaveBeenCalledOnce())
      if (status === 'authenticated') startAuthenticatedSession('new-session')
      else if (status === 'onboarding') setOnboardingSession()
      else {
        if (
          status === 'changed-then-logged-out' ||
          status === 'changed-then-expired'
        ) {
          startAuthenticatedSession('new-session')
        }
        clearAuthSession(
          status === 'changed-then-expired' ? 'expired' : undefined,
        )
      }
      client.setQueryData(['my-profile'], { nickname: '새 사용자' })
      await act(async () => {
        await router.navigate('/mypage')
      })
      expect(router.state.location.pathname).toBe('/mypage')
      await act(async () => {
        resolve(
          response(
            responseStatus,
            responseStatus === 401
              ? 'AUTH-001'
              : responseStatus === 409
                ? 'RESERVATION-008'
                : 'USER-204',
          ),
        )
      })
      await waitFor(() =>
        expect(client.getMutationCache().getAll()[0]?.state.status).toBe(
          responseStatus === 200 ? 'success' : 'error',
        ),
      )
      expect(client.getQueryData(['my-profile'])).toEqual({
        nickname: '새 사용자',
      })
      expect(getAccessToken()).toBe(
        status === 'authenticated' ? 'new-session' : undefined,
      )
      expect(router.state.location.pathname).toBe('/mypage')
      expect(showToast).not.toHaveBeenCalled()
    },
  )
})
