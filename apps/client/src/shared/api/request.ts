import type { Options } from 'ky'

import { ApiError } from '@/shared/api/apiError'
import { apiClient } from '@/shared/api/apiClient'
import { isErrorResponse, isSuccessResponse } from '@/shared/api/types'

const normalizePath = (path: string) => path.replace(/^\/+/, '')

const parseResponseBody = async (httpResponse: Response): Promise<unknown> => {
  try {
    return await httpResponse.json()
  } catch (cause) {
    if (!httpResponse.ok) {
      throw new ApiError({ status: httpResponse.status, cause })
    }

    throw new Error('Invalid API response', { cause })
  }
}

export const request = async <TData>(
  path: string,
  options?: Options,
): Promise<TData | null> => {
  const normalizedPath = normalizePath(path)
  const httpResponse = await apiClient(normalizedPath, options)
  const response = await parseResponseBody(httpResponse)

  if (isErrorResponse(response)) {
    throw new ApiError({ status: httpResponse.status, response })
  }

  if (!httpResponse.ok) {
    throw new ApiError({ status: httpResponse.status, cause: response })
  }

  if (!isSuccessResponse<TData>(response)) {
    throw new Error('Invalid API response', { cause: response })
  }

  return response.data
}
