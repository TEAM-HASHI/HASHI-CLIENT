import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authApi } from '@/shared/api/authApi'
import {
  clearAdminSession,
  getAdminSession,
  setAdminSession,
} from '@/shared/auth/adminSession'
import { reissueAdminSession } from '@/shared/auth/reissueAdminSession'

vi.mock('@/shared/api/authApi', () => ({
  authApi: {
    reissue: vi.fn(),
  },
}))

const reissueMock = vi.mocked(authApi.reissue)

describe('reissueAdminSession', () => {
  beforeEach(() => {
    window.localStorage.clear()
    reissueMock.mockReset()
    setAdminSession({
      accessToken: 'expired-token',
      issuedAt: '2026-07-17T00:00:00Z',
      loginId: 'hashi-admin',
    })
  })

  it('shares one in-flight reissue and preserves the admin identity', async () => {
    let resolveReissue: (accessToken: string) => void = () => undefined
    reissueMock.mockReturnValue(
      new Promise((resolve) => {
        resolveReissue = resolve
      }),
    )

    const firstReissue = reissueAdminSession()
    const secondReissue = reissueAdminSession()

    expect(firstReissue).toBe(secondReissue)
    expect(reissueMock).toHaveBeenCalledOnce()

    resolveReissue('renewed-token')
    await Promise.all([firstReissue, secondReissue])

    expect(getAdminSession()).toMatchObject({
      accessToken: 'renewed-token',
      loginId: 'hashi-admin',
    })
  })

  it('does not overwrite a newer login for the same admin ID', async () => {
    let resolveReissue: (accessToken: string) => void = () => undefined
    reissueMock.mockReturnValue(
      new Promise((resolve) => {
        resolveReissue = resolve
      }),
    )
    const reissue = reissueAdminSession()
    const newerSession = {
      accessToken: 'newer-token',
      issuedAt: '2026-07-21T00:00:00Z',
      loginId: 'hashi-admin',
    }

    setAdminSession(newerSession)
    resolveReissue('renewed-token')

    await expect(reissue).rejects.toThrow('관리자 세션이 변경되었습니다.')
    expect(getAdminSession()).toEqual(newerSession)
  })

  it('rejects reissue when no admin session exists', async () => {
    clearAdminSession()

    await expect(reissueAdminSession()).rejects.toThrow(
      '관리자 세션이 없습니다.',
    )
    expect(reissueMock).not.toHaveBeenCalled()
  })
})
