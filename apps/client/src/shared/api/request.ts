import type { Options } from 'ky'

import { requestTokenReissue } from '@/shared/api/requestTokenReissue'
import {
  clearAuthSession,
  getAccessToken,
  getAuthSessionVersion,
  setAccessToken,
} from '@/shared/auth/authSession'
import {
  ApiError,
  HttpStatusError,
  checkIsAuthRequiredError,
} from '@/shared/api/apiError'
import { getApiAccessToken } from '@/shared/api/accessToken'
import { apiClient } from '@/shared/api/apiClient'
import { isErrorResponse, isSuccessResponse } from '@/shared/api/types'
import type { SuccessResponse } from '@/shared/api/types'

const normalizePath = (path: string) => path.replace(/^\/+/, '')

const expiredAuthSessions = new WeakMap<Error, number>()

export const checkIsCurrentSessionExpiredError = (error: unknown) =>
  error instanceof Error &&
  expiredAuthSessions.get(error) === getAuthSessionVersion()

let pendingTokenReissue:
  | { sessionVersion: number; promise: Promise<string> }
  | undefined

const createHeaders = (headersInit: Options['headers']) => {
  const headers = new Headers()

  if (!headersInit) {
    return headers
  }

  if (headersInit instanceof Headers) {
    headersInit.forEach((value, key) => {
      headers.set(key, value)
    })

    return headers
  }

  if (Array.isArray(headersInit)) {
    headersInit.forEach(([key, value]) => {
      if (value !== undefined) {
        headers.set(key, value)
      }
    })

    return headers
  }

  Object.entries(headersInit).forEach(([key, value]) => {
    if (value !== undefined) {
      headers.set(key, value)
    }
  })

  return headers
}

const getRequestOptions = (
  path: string,
  options?: Options,
): Options | undefined => {
  const accessToken =
    getAccessToken() ?? (isAuthPath(path) ? null : getApiAccessToken())

  if (!accessToken) {
    return options
  }

  const headers = createHeaders(options?.headers)

  if (!headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  return {
    ...options,
    headers,
  }
}

const parseResponseBody = async (httpResponse: Response): Promise<unknown> => {
  try {
    return await httpResponse.json()
  } catch (cause) {
    if (!httpResponse.ok) {
      throw new HttpStatusError(httpResponse.status, { cause })
    }

    throw new Error('Invalid API response', { cause })
  }
}

const isAuthPath = (path: string) => path.startsWith('api/v1/auth/')

const shouldTryTokenReissue = (path: string, cause: unknown) =>
  checkIsAuthRequiredError(cause) && !isAuthPath(path)

const reissueAccessToken = async () => {
  const sessionVersion = getAuthSessionVersion()
  if (pendingTokenReissue?.sessionVersion === sessionVersion) {
    return pendingTokenReissue.promise
  }

  const promise = requestTokenReissue()
    .then(({ accessToken }) => {
      if (getAuthSessionVersion() !== sessionVersion) {
        throw new Error('Auth session ended during token reissue')
      }
      setAccessToken(accessToken)
      return accessToken
    })
    .finally(() => {
      if (pendingTokenReissue?.promise === promise) {
        pendingTokenReissue = undefined
      }
    })

  pendingTokenReissue = { sessionVersion, promise }
  return promise
}

const requestSuccessResponseOnce = async <TData>(
  normalizedPath: string,
  options?: Options,
): Promise<SuccessResponse<TData>> => {
  const httpResponse = await apiClient(
    normalizedPath,
    getRequestOptions(normalizedPath, options),
  )
  const response = await parseResponseBody(httpResponse)

  if (isErrorResponse(response)) {
    throw new ApiError(response, httpResponse.status)
  }

  if (!httpResponse.ok) {
    throw new HttpStatusError(httpResponse.status, { cause: response })
  }

  if (!isSuccessResponse<TData>(response)) {
    throw new Error('Invalid API response', { cause: response })
  }

  return response
}

export const requestSuccessResponse = async <TData>(
  path: string,
  options?: Options,
): Promise<SuccessResponse<TData>> => {
  const normalizedPath = normalizePath(path)
  const sessionVersion = getAuthSessionVersion()

  try {
    return await requestSuccessResponseOnce<TData>(normalizedPath, options)
  } catch (cause) {
    if (
      getAuthSessionVersion() !== sessionVersion ||
      !shouldTryTokenReissue(normalizedPath, cause)
    ) {
      throw cause
    }

    try {
      await reissueAccessToken()
    } catch (reissueCause) {
      if (checkIsAuthRequiredError(reissueCause)) {
        if (getAuthSessionVersion() === sessionVersion) {
          if (reissueCause instanceof Error)
            expiredAuthSessions.set(reissueCause, sessionVersion + 1)
          clearAuthSession()
        }
        if (
          cause instanceof Error &&
          reissueCause instanceof Error &&
          expiredAuthSessions.get(reissueCause) === sessionVersion + 1
        )
          expiredAuthSessions.set(cause, sessionVersion + 1)
        throw cause
      }
      if (getAuthSessionVersion() !== sessionVersion) throw cause
      throw reissueCause
    }

    if (getAuthSessionVersion() !== sessionVersion) throw cause
    return requestSuccessResponseOnce<TData>(normalizedPath, options)
  }
}

export const request = async <TData>(
  path: string,
  options?: Options,
): Promise<TData | null> => {
  const response = await requestSuccessResponse<TData>(path, options)

  return response.data
}
