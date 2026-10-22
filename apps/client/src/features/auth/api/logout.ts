import { apiClient } from '@/shared/api/apiClient'
import { ApiError, HttpStatusError } from '@/shared/api/apiError'
import { isErrorResponse, isSuccessResponse } from '@/shared/api/types'

export const requestLogout = async (): Promise<void> => {
  const httpResponse = await apiClient('api/v1/auth/logout', {
    method: 'post',
    credentials: 'include',
  })
  let response: unknown
  try {
    response = await httpResponse.json()
  } catch (cause) {
    if (!httpResponse.ok) {
      throw new HttpStatusError(httpResponse.status, { cause })
    }
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
}
