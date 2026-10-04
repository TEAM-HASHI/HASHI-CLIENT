import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getMyInfo } from '@/features/user/api/getMyInfo'
import { request } from '@/shared/api/request'

vi.mock('@/shared/api/request', () => ({
  request: vi.fn(),
}))

const mockedRequest = vi.mocked(request)

describe('getMyInfo', () => {
  beforeEach(() => {
    mockedRequest.mockReset()
  })

  it('maps the current profile information for the edit form', async () => {
    mockedRequest.mockResolvedValue({
      nickname: '하시',
      nameEng: 'HASHI',
      birthDate: '1998-05-12',
      phone: '01012345678',
      email: 'hashi@example.com',
      profileImageUrl: 'https://example.com/profile.png',
    })

    await expect(getMyInfo()).resolves.toEqual({
      nickname: '하시',
      englishName: 'HASHI',
      birthDate: '1998-05-12',
      phoneNumber: '01012345678',
      email: 'hashi@example.com',
      profileImageUrl: 'https://example.com/profile.png',
    })
    expect(mockedRequest).toHaveBeenCalledWith('/api/v1/users/me')
  })

  it('throws when required profile information is missing', async () => {
    mockedRequest.mockResolvedValue({
      nickname: '하시',
      profileImageUrl: null,
    })

    await expect(getMyInfo()).rejects.toThrow('Missing my profile information')
  })
})
