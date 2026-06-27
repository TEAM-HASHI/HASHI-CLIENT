import { HTTPError, type Options } from 'ky'
import { apiClient } from './apiClient'
import { ApiError } from './errors'
import type { ApiResponse, ErrorResponse } from './types'

const parseErrorResponse = async (error: HTTPError) => {
  try {
    const body = await error.response.json<ErrorResponse>()

    return new ApiError(body, error.response.status)
  } catch {
    return error
  }
}

export const request = async <TData>(
  path: string,
  options?: Options,
): Promise<TData | undefined> => {
  try {
    const response = await apiClient(path, options).json<ApiResponse<TData>>()

    if (!response.success) {
      throw new ApiError(response)
    }

    return response.data
  } catch (error) {
    if (error instanceof HTTPError) {
      throw await parseErrorResponse(error)
    }

    throw error
  }
}
