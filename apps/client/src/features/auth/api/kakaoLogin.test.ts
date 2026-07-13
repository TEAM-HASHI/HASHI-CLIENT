import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiClient } from '@/shared/api/apiClient'

import { requestKakaoLogin } from '@/features/auth/api/kakaoLogin'

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

describe('requestKakaoLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('posts only authorization code and extracts bearer access token', async () => {
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        authorization: 'Bearer access-token',
        body: {
          success: true,
          code: 'AUTH-200',
          message: '로그인에 성공했습니다',
          data: {
            registered: true,
          },
        },
      }) as never,
    )

    await expect(requestKakaoLogin('kakao-code')).resolves.toEqual({
      registered: true,
      accessToken: 'access-token',
    })
    expect(mockedApiClient).toHaveBeenCalledWith('api/v1/auth/kakao/login', {
      method: 'post',
      json: { code: 'kakao-code' },
      credentials: 'include',
    })
  })

  it('does not require Authorization header for new users', async () => {
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        body: {
          success: true,
          code: 'AUTH-201',
          message: '회원가입이 필요합니다',
          data: {
            registered: false,
          },
        },
      }) as never,
    )

    await expect(requestKakaoLogin('new-user-code')).resolves.toEqual({
      registered: false,
      accessToken: undefined,
    })
  })

  it('throws when an existing user response omits Authorization header', async () => {
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        body: {
          success: true,
          code: 'AUTH-200',
          message: '로그인에 성공했습니다',
          data: {
            registered: true,
          },
        },
      }) as never,
    )

    await expect(requestKakaoLogin('kakao-code')).rejects.toThrow(
      'Authorization header is missing.',
    )
  })

  it('throws when an existing user response uses a non-Bearer Authorization header', async () => {
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        authorization: 'Basic access-token',
        body: {
          success: true,
          code: 'AUTH-200',
          message: '로그인에 성공했습니다',
          data: {
            registered: true,
          },
        },
      }) as never,
    )

    await expect(requestKakaoLogin('kakao-code')).rejects.toThrow(
      'Authorization header is missing.',
    )
  })

  it('throws when success response omits registered flag', async () => {
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        body: {
          success: true,
          code: 'AUTH-200',
          message: '로그인에 성공했습니다',
          data: {},
        },
      }) as never,
    )

    await expect(requestKakaoLogin('kakao-code')).rejects.toThrow(
      'Invalid API response',
    )
  })

  it('throws when success response omits data', async () => {
    mockedApiClient.mockResolvedValue(
      createHttpResponse({
        body: {
          success: true,
          code: 'AUTH-200',
          message: '로그인에 성공했습니다',
          data: null,
        },
      }) as never,
    )

    await expect(requestKakaoLogin('kakao-code')).rejects.toThrow(
      'Invalid API response',
    )
  })
})
