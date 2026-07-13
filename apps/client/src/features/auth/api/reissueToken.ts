import { ApiError, HttpStatusError } from '@/shared/api/apiError'
import { apiClient } from '@/shared/api/apiClient'
import { isErrorResponse, isSuccessResponse } from '@/shared/api/types'

export interface TokenReissueResult {
  accessToken: string
}

const TOKEN_REISSUE_PATH = 'api/v1/auth/reissue'
const AUTHORIZATION_HEADER_MISSING_MESSAGE = 'Authorization header is missing.'

const extractAccessToken = (headers: Headers) => {
  const authorizationHeader = headers.get('Authorization')

  if (!authorizationHeader) {
    return undefined
  }

  return authorizationHeader.replace(/^Bearer\s+/i, '').trim() || undefined
}

export const requestTokenReissue = async (): Promise<TokenReissueResult> => {
  const httpResponse = await apiClient(TOKEN_REISSUE_PATH, {
    method: 'post',
    credentials: 'include',
  })
  const response: unknown = await httpResponse.json()

  if (isErrorResponse(response)) {
    throw new ApiError(response, httpResponse.status)
  }

  if (!httpResponse.ok) {
    throw new HttpStatusError(httpResponse.status, { cause: response })
  }

  if (!isSuccessResponse<null>(response)) {
    throw new Error('Invalid API response', { cause: response })
  }

  const accessToken = extractAccessToken(httpResponse.headers)

  if (!accessToken) {
    throw new Error(AUTHORIZATION_HEADER_MISSING_MESSAGE)
  }

  return {
    accessToken,
  }
}
