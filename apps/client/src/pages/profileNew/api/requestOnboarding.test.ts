import { describe, expect, it, vi } from 'vitest'

import {
  requestOnboarding,
  type OnboardingRequestBody,
} from '@/pages/profileNew/api/requestOnboarding'
import { request } from '@/shared/api/request'

vi.mock('@/shared/api/request', () => ({
  request: vi.fn(),
}))

const mockedRequest = vi.mocked(request)

describe('requestOnboarding', () => {
  it('posts onboarding body and returns user id', async () => {
    const body: OnboardingRequestBody = {
      nickname: '김하람',
      birthDate: '1998-05-12',
      phone: '01078757856',
      email: 'hashi@example.com',
      nameEng: 'HARAM KIM',
      profileImageKey: 'users/15/profile/8f3a-profile.jpg',
    }

    mockedRequest.mockResolvedValue({ userId: 15 })

    await expect(requestOnboarding(body)).resolves.toEqual({ userId: 15 })
    expect(mockedRequest).toHaveBeenCalledWith('api/v1/users/onboarding', {
      method: 'post',
      credentials: 'include',
      json: body,
    })
  })

  it('rejects when success response data does not include user id', async () => {
    mockedRequest.mockResolvedValue({})

    await expect(
      requestOnboarding({
        nickname: '김하람',
        birthDate: '1998-05-12',
        phone: '01078757856',
        email: 'hashi@example.com',
      }),
    ).rejects.toThrow('Onboarding response data is invalid')
  })
})
