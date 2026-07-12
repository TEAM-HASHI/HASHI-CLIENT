import type { Options } from 'ky'

import { ApiError, HttpStatusError } from '@/shared/api/apiError'
import { apiClient } from '@/shared/api/apiClient'
import { isErrorResponse, isSuccessResponse } from '@/shared/api/types'
import type { SuccessResponse } from '@/shared/api/types'

const normalizePath = (path: string) => path.replace(/^\/+/, '')

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

export const requestSuccessResponse = async <TData>(
  path: string,
  options?: Options,
): Promise<SuccessResponse<TData>> => {
  const normalizedPath = normalizePath(path)
  const httpResponse = await apiClient(normalizedPath, options)
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

export const request = async <TData>(
  path: string,
  options?: Options,
): Promise<TData | null> => {
  const response = await requestSuccessResponse<TData>(path, options)

  return response.data
}
