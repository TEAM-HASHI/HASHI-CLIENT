import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useLogoutMutation } from '@/features/auth/hooks/useLogoutMutation'
import { apiClient } from '@/shared/api/apiClient'
import {
  getAccessToken,
  setAccessToken,
  clearAuthSession,
  startAuthenticatedSession,
} from '@/shared/auth/authSession'

vi.mock('@/shared/api/apiClient', () => ({ apiClient: vi.fn() }))

const setup = () => {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  client.setQueryData(['my-profile'], { nickname: '이전 사용자' })
  client.setQueryData(['restaurants'], { isSaved: true })
  const onLoggedOut = vi.fn()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  setAccessToken('access-token')
  const hook = renderHook(() => useLogoutMutation(onLoggedOut), { wrapper })
  return { ...hook, client, onLoggedOut }
}

afterEach(() => {
  clearAuthSession()
  vi.resetAllMocks()
})

describe('useLogoutMutation', () => {
  it('sends only the refresh cookie and clears session-dependent caches after success', async () => {
    vi.mocked(apiClient).mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          code: 'AUTH-205',
          message: '로그아웃에 성공했습니다',
          data: null,
        }),
      ),
    )
    const { result, client, onLoggedOut } = setup()
    await act(async () => {
      await result.current.mutateAsync()
    })
    expect(apiClient).toHaveBeenCalledWith('api/v1/auth/logout', {
      method: 'post',
      credentials: 'include',
    })
    expect(getAccessToken()).toBeUndefined()
    expect(client.getQueryCache().getAll()).toHaveLength(0)
    expect(onLoggedOut).toHaveBeenCalledOnce()
  })

  it('preserves session and caches when the server rejects logout', async () => {
    vi.mocked(apiClient).mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          code: 'COMMON-403',
          message: '접근 권한이 없습니다.',
          data: null,
          timestamp: '2026-10-05',
          path: '/api/v1/auth/logout',
        }),
        { status: 403 },
      ),
    )
    const { result, client, onLoggedOut } = setup()
    await act(async () => {
      await expect(result.current.mutateAsync()).rejects.toThrow()
    })
    expect(getAccessToken()).toBe('access-token')
    expect(client.getQueryData(['my-profile'])).toBeDefined()
    expect(onLoggedOut).not.toHaveBeenCalled()
  })

  it('does not clear a new session or its caches when an older logout succeeds', async () => {
    let resolveLogout!: (response: Response) => void
    vi.mocked(apiClient).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveLogout = resolve
        }) as never,
    )
    const { result, client, onLoggedOut } = setup()
    let completion!: Promise<unknown>
    await act(async () => {
      completion = result.current.mutateAsync()
    })
    await waitFor(() => expect(apiClient).toHaveBeenCalledOnce())
    startAuthenticatedSession('new-session')
    client.setQueryData(['my-profile'], { nickname: '새 사용자' })
    await act(async () => {
      resolveLogout(
        new Response(
          JSON.stringify({
            success: true,
            code: 'AUTH-205',
            message: 'ok',
            data: null,
          }),
        ),
      )
      await completion
    })
    expect(getAccessToken()).toBe('new-session')
    expect(client.getQueryData(['my-profile'])).toEqual({
      nickname: '새 사용자',
    })
    expect(onLoggedOut).not.toHaveBeenCalled()
  })
})
