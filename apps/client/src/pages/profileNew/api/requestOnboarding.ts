import type { components } from '@/shared/api/generated/openapi'
import { ApiError, HttpStatusError } from '@/shared/api/apiError'
import { apiClient } from '@/shared/api/apiClient'
import { isErrorResponse, isSuccessResponse } from '@/shared/api/types'
import type { ApiResponse } from '@/shared/api/types'
import { extractBearerToken } from '@/features/auth/utils/extractBearerToken'

export type OnboardingRequestBody =
  components['schemas']['CompleteOnboardingRequest']

export type OnboardingResponseData = components['schemas']['OnboardingResponse']

export interface OnboardingResult {
  userId: number
  accessToken: string
}

const AUTHORIZATION_HEADER_MISSING_MESSAGE = 'Authorization header is missing.'

export const requestOnboarding = async (body: OnboardingRequestBody) => {
  const httpResponse = await apiClient('api/v1/users/onboarding', {
    method: 'post',
    credentials: 'include',
    json: body,
  })
  let response: ApiResponse<OnboardingResponseData>

  try {
    response = await httpResponse.json<ApiResponse<OnboardingResponseData>>()
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
    throw new HttpStatusError(httpResponse.status, { cause: response })
  }

  if (!isSuccessResponse<OnboardingResponseData>(response)) {
    throw new Error('Invalid API response', { cause: response })
  }

  const data = response.data

  if (!data || typeof data.userId !== 'number') {
    throw new Error('Onboarding response data is invalid')
  }

  const accessToken = extractBearerToken(httpResponse.headers)

  if (!accessToken) {
    throw new Error(AUTHORIZATION_HEADER_MISSING_MESSAGE)
  }

  return {
    userId: data.userId,
    accessToken,
  } satisfies OnboardingResult
}
