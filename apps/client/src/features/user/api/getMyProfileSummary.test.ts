import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getMyProfileSummary } from '@/features/user/api/getMyProfileSummary'
import { request } from '@/shared/api/request'

vi.mock('@/shared/api/request', () => ({
  request: vi.fn(),
}))

const mockedRequest = vi.mocked(request)

describe('getMyProfileSummary', () => {
  beforeEach(() => {
    mockedRequest.mockReset()
  })

  it('maps current user profile summary', async () => {
    mockedRequest.mockResolvedValue({
      nickname: '테스트유저',
      profileImageUrl: 'https://example.com/profile.png',
    })

    await expect(getMyProfileSummary()).resolves.toEqual({
      nickname: '테스트유저',
      profileImageUrl: 'https://example.com/profile.png',
    })
    expect(mockedRequest).toHaveBeenCalledWith(
      '/api/v1/users/me/profile-summary',
    )
  })

  it('normalizes missing profile image to null', async () => {
    mockedRequest.mockResolvedValue({
      nickname: '테스트유저',
    })

    await expect(getMyProfileSummary()).resolves.toEqual({
      nickname: '테스트유저',
      profileImageUrl: null,
    })
  })

  it('throws when nickname is missing from a successful response', async () => {
    mockedRequest.mockResolvedValue({
      profileImageUrl: 'https://example.com/profile.png',
    })

    await expect(getMyProfileSummary()).rejects.toThrow(
      'Missing my profile nickname',
    )
  })
})
