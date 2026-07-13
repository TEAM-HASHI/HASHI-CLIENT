import type { Options } from 'ky'

import { requestTokenReissue } from '@/features/auth/api/reissueToken'
import {
  clearAuthSession,
  getAccessToken,
  setAccessToken,
} from '@/features/auth/session/authSession'
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

let tokenReissuePromise: Promise<string> | undefined

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

const getRequestOptions = (options?: Options): Options | undefined => {
  const accessToken = getAccessToken() ?? getApiAccessToken()

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
  if (!tokenReissuePromise) {
    tokenReissuePromise = requestTokenReissue()
      .then(({ accessToken }) => {
        setAccessToken(accessToken)
        return accessToken
      })
      .finally(() => {
        tokenReissuePromise = undefined
      })
  }

  return tokenReissuePromise
}

const requestSuccessResponseOnce = async <TData>(
  normalizedPath: string,
  options?: Options,
): Promise<SuccessResponse<TData>> => {
  const httpResponse = await apiClient(
    normalizedPath,
    getRequestOptions(options),
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

  try {
    return await requestSuccessResponseOnce<TData>(normalizedPath, options)
  } catch (cause) {
    if (!shouldTryTokenReissue(normalizedPath, cause)) {
      throw cause
    }

    try {
      await reissueAccessToken()
    } catch {
      clearAuthSession()
      throw cause
    }

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
