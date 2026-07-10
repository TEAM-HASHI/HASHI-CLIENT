import type { Options } from 'ky'
import { ApiError } from '@/shared/api/apiError'
import { apiClient } from '@/shared/api/apiClient'
import { isErrorResponse, type ApiResponse } from '@/shared/api/types'

const normalizePath = (path: string) => path.replace(/^\/+/, '')

export const request = async <TData>(
  path: string,
  options?: Options,
): Promise<TData | null> => {
  const normalizedPath = normalizePath(path)
  const httpResponse = await apiClient(normalizedPath, options)
  const response = await httpResponse.json<ApiResponse<TData>>()

  if (isErrorResponse(response)) {
    throw new ApiError(response)
  }

  if (!httpResponse.ok) {
    throw new Error(`HTTP ${httpResponse.status}`)
  }

  return response.data
}
