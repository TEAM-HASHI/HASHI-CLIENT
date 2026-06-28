import type { Options } from 'ky'
import { apiClient } from './apiClient'
import type { ApiResponse } from './types'

export const request = async <TData>(
  path: string,
  options?: Options,
): Promise<TData | undefined> => {
  const response = await apiClient(path, options).json<ApiResponse<TData>>()

  if (!response.success) {
    throw new Error(response.message)
  }

  return response.data
}
