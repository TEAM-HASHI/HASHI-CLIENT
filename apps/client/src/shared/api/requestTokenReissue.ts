import { ApiError, HttpStatusError } from '@/shared/api/apiError'
import { apiClient } from '@/shared/api/apiClient'
import { extractBearerToken } from '@/shared/api/extractBearerToken'
import { isErrorResponse, isSuccessResponse } from '@/shared/api/types'
import { getAuthSessionVersion } from '@/shared/auth/authSession'

export interface TokenReissueResult {
  accessToken: string
}

const TOKEN_REISSUE_PATH = 'api/v1/auth/reissue'
const TOKEN_REISSUE_LOCK_NAME = 'hashi:user-token-reissue'
const AUTHORIZATION_HEADER_MISSING_MESSAGE = 'Authorization header is missing.'

let pendingReissue:
  | { sessionVersion: number; promise: Promise<TokenReissueResult> }
  | undefined

const requestTokenReissueOnce = async (): Promise<TokenReissueResult> => {
  const httpResponse = await apiClient(TOKEN_REISSUE_PATH, {
    method: 'post',
    credentials: 'include',
  })
  let response: unknown
  try {
    response = await httpResponse.json()
  } catch (cause) {
    if (!httpResponse.ok)
      throw new HttpStatusError(httpResponse.status, { cause })
    throw new Error('Invalid API response', { cause })
  }

  if (isErrorResponse(response)) {
    throw new ApiError(response, httpResponse.status)
  }

  if (!httpResponse.ok) {
    throw new HttpStatusError(httpResponse.status, { cause: response })
  }

  if (!isSuccessResponse<null>(response)) {
    throw new Error('Invalid API response', { cause: response })
  }

  const accessToken = extractBearerToken(httpResponse.headers)

  if (!accessToken) {
    throw new Error(AUTHORIZATION_HEADER_MISSING_MESSAGE)
  }

  return {
    accessToken,
  }
}

export const requestTokenReissue = (): Promise<TokenReissueResult> => {
  const sessionVersion = getAuthSessionVersion()
  if (pendingReissue?.sessionVersion === sessionVersion)
    return pendingReissue.promise

  const reissueWhenCurrent = () => {
    if (getAuthSessionVersion() !== sessionVersion) {
      return Promise.reject(
        new Error('Auth session changed while waiting for token reissue'),
      )
    }
    return requestTokenReissueOnce()
  }
  const locks = typeof navigator === 'undefined' ? undefined : navigator.locks
  const promise = Promise.resolve(
    locks
      ? locks.request(TOKEN_REISSUE_LOCK_NAME, reissueWhenCurrent)
      : reissueWhenCurrent(),
  ).finally(() => {
    if (pendingReissue?.promise === promise) pendingReissue = undefined
  })
  pendingReissue = { sessionVersion, promise }
  return promise
}
