import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

export type OnboardingRequestBody =
  components['schemas']['CompleteOnboardingRequest']

export type OnboardingResponseData = components['schemas']['OnboardingResponse']

export const requestOnboarding = async (body: OnboardingRequestBody) => {
  const data = await request<OnboardingResponseData>(
    'api/v1/users/onboarding',
    {
      method: 'post',
      json: body,
    },
  )

  if (!data || typeof data.userId !== 'number') {
    throw new Error('Onboarding response data is invalid')
  }

  return data
}
