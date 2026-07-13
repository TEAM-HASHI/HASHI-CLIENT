import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

type ProfileSummaryResponse = components['schemas']['ProfileSummaryResponse']

export type MyProfileSummary = {
  nickname: string
  profileImageUrl?: string | null
}

export const getMyProfileSummary = async (): Promise<MyProfileSummary> => {
  const response = await request<ProfileSummaryResponse>(
    '/api/v1/users/me/profile-summary',
  )

  if (!response?.nickname) {
    throw new Error('Missing my profile nickname')
  }

  return {
    nickname: response.nickname,
    profileImageUrl: response?.profileImageUrl ?? null,
  }
}
