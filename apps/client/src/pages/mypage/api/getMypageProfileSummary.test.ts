import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getMypageProfileSummary } from '@/pages/mypage/api/getMypageProfileSummary'
import { request } from '@/shared/api/request'

vi.mock('@/shared/api/request', () => ({
  request: vi.fn(),
}))

const mockRequest = vi.mocked(request)

describe('getMypageProfileSummary', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('maps current user profile summary', async () => {
    mockRequest.mockResolvedValue({
      nickname: '테스트유저',
      profileImageUrl: 'https://example.com/profile.png',
    })

    await expect(getMypageProfileSummary()).resolves.toEqual({
      nickname: '테스트유저',
      profileImageUrl: 'https://example.com/profile.png',
    })
    expect(mockRequest).toHaveBeenCalledWith('/api/v1/users/me/profile-summary')
  })

  it('normalizes missing profile image to null', async () => {
    mockRequest.mockResolvedValue({
      nickname: '테스트유저',
    })

    await expect(getMypageProfileSummary()).resolves.toEqual({
      nickname: '테스트유저',
      profileImageUrl: null,
    })
  })

  it('throws when nickname is missing from a successful response', async () => {
    mockRequest.mockResolvedValue({
      profileImageUrl: 'https://example.com/profile.png',
    })

    await expect(getMypageProfileSummary()).rejects.toThrow(
      'Missing mypage profile nickname',
    )
  })
})
