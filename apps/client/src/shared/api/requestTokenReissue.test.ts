import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { apiClient } from '@/shared/api/apiClient'
import { requestTokenReissue } from '@/shared/api/requestTokenReissue'
import { clearAuthSession } from '@/shared/auth/authSession'

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: vi.fn(),
}))

const mockedApiClient = vi.mocked(apiClient)

const createHttpResponse = ({
  ok = true,
  status = 200,
  body,
  authorization,
}: {
  ok?: boolean
  status?: number
  body: unknown
  authorization?: string
}) => ({
  ok,
  status,
  headers: new Headers(
    authorization ? { Authorization: authorization } : undefined,
  ),
  json: () => Promise.resolve(body),
})

describe('requestTokenReissue', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('posts without body and extracts bearer access token from Authorization header', async () => {
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        authorization: 'Bearer reissued-access-token',
        body: {
          success: true,
          code: 'AUTH-202',
          message: '토큰이 재발급되었습니다',
          data: null,
        },
      }) as never,
    )

    await expect(requestTokenReissue()).resolves.toEqual({
      accessToken: 'reissued-access-token',
    })
    expect(mockedApiClient).toHaveBeenCalledWith('api/v1/auth/reissue', {
      method: 'post',
      credentials: 'include',
    })
  })

  it('throws when successful reissue omits Authorization header', async () => {
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        body: {
          success: true,
          code: 'AUTH-202',
          message: '토큰이 재발급되었습니다',
          data: null,
        },
      }) as never,
    )

    await expect(requestTokenReissue()).rejects.toThrow(
      'Authorization header is missing.',
    )
  })

  it('throws when successful reissue uses a non-Bearer Authorization header', async () => {
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        authorization: 'Basic reissued-access-token',
        body: {
          success: true,
          code: 'AUTH-202',
          message: '토큰이 재발급되었습니다',
          data: null,
        },
      }) as never,
    )

    await expect(requestTokenReissue()).rejects.toThrow(
      'Authorization header is missing.',
    )
  })

  it('throws ApiError when reissue returns an error response', async () => {
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        ok: false,
        status: 401,
        body: {
          success: false,
          code: 'AUTH-003',
          message: '리프레시 토큰이 존재하지 않습니다',
          data: null,
          timestamp: '2026-07-12T19:36:51.713886635',
          path: '/api/v1/auth/reissue',
        },
      }) as never,
    )

    await expect(requestTokenReissue()).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
      code: 'AUTH-003',
    })
  })

  it('shares concurrent reissues but isolates a new login session', async () => {
    let resolveOld!: (response: never) => void
    mockedApiClient.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveOld = resolve
        }) as never,
    )
    const oldRequest = requestTokenReissue()
    expect(requestTokenReissue()).toBe(oldRequest)
    clearAuthSession()
    mockedApiClient.mockResolvedValueOnce(
      createHttpResponse({
        authorization: 'Bearer new-token',
        body: { success: true, code: 'AUTH-202', message: 'ok', data: null },
      }) as never,
    )
    const newRequest = requestTokenReissue()
    expect(newRequest).not.toBe(oldRequest)
    await expect(newRequest).resolves.toEqual({ accessToken: 'new-token' })
    resolveOld(
      createHttpResponse({
        authorization: 'Bearer old-token',
        body: { success: true, code: 'AUTH-202', message: 'ok', data: null },
      }) as never,
    )
    await oldRequest
    expect(mockedApiClient).toHaveBeenCalledTimes(2)
  })

  it.each([401, 503])(
    'preserves HTTP %i when reissue has no JSON body',
    async (status) => {
      mockedApiClient.mockResolvedValueOnce({
        ok: false,
        status,
        json: () => Promise.reject(new SyntaxError('Unexpected token')),
      } as never)
      await expect(requestTokenReissue()).rejects.toMatchObject({
        name: 'HttpStatusError',
        status,
      })
    },
  )

  it.each(['success', 'failure'] as const)(
    'serializes independent tabs and releases the lock after %s',
    async (outcome) => {
      let queue: Promise<unknown> = Promise.resolve()
      const requestLock = vi.fn(
        (_name: string, callback: () => Promise<unknown>) => {
          const result = queue.then(callback)
          queue = result.catch(() => undefined)
          return result
        },
      )
      vi.stubGlobal('navigator', { locks: { request: requestLock } })
      vi.resetModules()
      const tabA = await import('@/shared/api/requestTokenReissue')
      vi.resetModules()
      const tabB = await import('@/shared/api/requestTokenReissue')
      let resolveFirst!: (response: never) => void
      mockedApiClient.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve
          }) as never,
      )
      mockedApiClient.mockResolvedValueOnce(
        createHttpResponse({
          authorization: 'Bearer tab-b-token',
          body: { success: true, code: 'AUTH-202', message: 'ok', data: null },
        }) as never,
      )
      const first = tabA.requestTokenReissue()
      const firstResult =
        outcome === 'success'
          ? expect(first).resolves.toEqual({ accessToken: 'tab-a-token' })
          : expect(first).rejects.toMatchObject({ status: 503 })
      const second = tabB.requestTokenReissue()
      const secondResult = expect(second).resolves.toEqual({
        accessToken: 'tab-b-token',
      })
      await vi.waitFor(() => expect(mockedApiClient).toHaveBeenCalledTimes(1))
      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(mockedApiClient).toHaveBeenCalledTimes(1)
      expect(requestLock).toHaveBeenCalledTimes(2)
      resolveFirst(
        createHttpResponse({
          ok: outcome === 'success',
          status: outcome === 'success' ? 200 : 503,
          authorization: 'Bearer tab-a-token',
          body: { success: true, code: 'AUTH-202', message: 'ok', data: null },
        }) as never,
      )
      await firstResult
      await secondResult
      expect(mockedApiClient).toHaveBeenCalledTimes(2)
    },
  )

  it('does not send a reissue after the session changes while waiting for the cross-tab lock', async () => {
    let acquire!: () => Promise<unknown>
    const requestLock = vi.fn(
      (_name: string, callback: () => Promise<unknown>) =>
        new Promise((resolve, reject) => {
          acquire = async () => {
            try {
              resolve(await callback())
            } catch (cause) {
              reject(cause)
            }
          }
        }),
    )
    vi.stubGlobal('navigator', { locks: { request: requestLock } })
    vi.resetModules()
    const tab = await import('@/shared/api/requestTokenReissue')
    const session = await import('@/shared/auth/authSession')
    const pending = tab.requestTokenReissue()
    const rejection = expect(pending).rejects.toThrow(
      'Auth session changed while waiting for token reissue',
    )
    await vi.waitFor(() => expect(requestLock).toHaveBeenCalledOnce())
    session.clearAuthSession()
    await acquire()
    await rejection
    expect(mockedApiClient).not.toHaveBeenCalled()
  })
})
