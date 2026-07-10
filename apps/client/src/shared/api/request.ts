import type { Options } from 'ky'
import { ApiError, HttpStatusError } from '@/shared/api/apiError'
import { apiClient } from '@/shared/api/apiClient'
import { isErrorResponse, type ApiResponse } from '@/shared/api/types'

const normalizePath = (path: string) => path.replace(/^\/+/, '')

export const request = async <TData>(
  path: string,
  options?: Options,
): Promise<TData | null> => {
  const normalizedPath = normalizePath(path)
  const httpResponse = await apiClient(normalizedPath, options)
  let response: ApiResponse<TData>

  try {
    response = await httpResponse.json<ApiResponse<TData>>()
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

  return response.data
}
