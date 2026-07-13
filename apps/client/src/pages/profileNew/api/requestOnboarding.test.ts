import { describe, expect, it, vi } from 'vitest'

import {
  requestOnboarding,
  type OnboardingRequestBody,
} from '@/pages/profileNew/api/requestOnboarding'
import { apiClient } from '@/shared/api/apiClient'

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: vi.fn(),
}))

const mockedApiClient = vi.mocked(apiClient)

const createHttpResponse = ({
  ok = true,
  status = 201,
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

    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        authorization: 'Bearer onboarding-access-token',
        body: {
          success: true,
          code: 'USER-201',
          message: '회원가입이 완료되었습니다',
          data: { userId: 15 },
        },
      }) as never,
    )

    await expect(requestOnboarding(body)).resolves.toEqual({
      userId: 15,
      accessToken: 'onboarding-access-token',
    })
    expect(mockedApiClient).toHaveBeenCalledWith('api/v1/users/onboarding', {
      method: 'post',
      credentials: 'include',
      json: body,
    })
  })

  it('rejects when success response data does not include user id', async () => {
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        authorization: 'Bearer onboarding-access-token',
        body: {
          success: true,
          code: 'USER-201',
          message: '회원가입이 완료되었습니다',
          data: {},
        },
      }) as never,
    )

    await expect(
      requestOnboarding({
        nickname: '김하람',
        birthDate: '1998-05-12',
        phone: '01078757856',
        email: 'hashi@example.com',
      }),
    ).rejects.toThrow('Onboarding response data is invalid')
  })

  it('rejects when success response omits Authorization header', async () => {
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        body: {
          success: true,
          code: 'USER-201',
          message: '회원가입이 완료되었습니다',
          data: { userId: 15 },
        },
      }) as never,
    )

    await expect(
      requestOnboarding({
        nickname: '김하람',
        birthDate: '1998-05-12',
        phone: '01078757856',
        email: 'hashi@example.com',
      }),
    ).rejects.toThrow('Authorization header is missing.')
  })
})
