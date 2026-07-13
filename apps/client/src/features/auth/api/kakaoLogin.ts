import type { components } from '@/shared/api/generated/openapi'
import { ApiError, HttpStatusError } from '@/shared/api/apiError'
import { apiClient } from '@/shared/api/apiClient'
import { isErrorResponse, type ApiResponse } from '@/shared/api/types'
import { extractBearerToken } from '@/features/auth/utils/extractBearerToken'

type KakaoLoginRequest = components['schemas']['KakaoLoginRequest']
type KakaoLoginData = components['schemas']['KakaoLoginResponse']

export interface KakaoLoginResult {
  registered: boolean
  accessToken?: string
}

const KAKAO_LOGIN_PATH = 'api/v1/auth/kakao/login'
const AUTHORIZATION_HEADER_MISSING_MESSAGE = 'Authorization header is missing.'

export const requestKakaoLogin = async (
  code: string,
): Promise<KakaoLoginResult> => {
  const requestBody: KakaoLoginRequest = { code }
  const httpResponse = await apiClient(KAKAO_LOGIN_PATH, {
    method: 'post',
    json: requestBody,
    credentials: 'include',
  })
  let response: ApiResponse<KakaoLoginData>

  try {
    response = await httpResponse.json<ApiResponse<KakaoLoginData>>()
  } catch (error) {
    if (!httpResponse.ok) {
      throw new HttpStatusError(httpResponse.status, { cause: error })
    }

    throw error
  }

  if (isErrorResponse(response)) {
    throw new ApiError(response, httpResponse.status)
  }

  if (!httpResponse.ok) {
    throw new HttpStatusError(httpResponse.status)
  }

  const registered = response.data?.registered

  if (typeof registered !== 'boolean') {
    throw new Error('Invalid API response')
  }

  if (!registered) {
    return {
      registered,
      accessToken: undefined,
    }
  }

  const accessToken = extractBearerToken(httpResponse.headers)

  if (!accessToken) {
    throw new Error(AUTHORIZATION_HEADER_MISSING_MESSAGE)
  }

  return {
    registered,
    accessToken,
  }
}
