import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

type ProfileSummaryResponse = components['schemas']['ProfileSummaryResponse']

type MypageProfileSummary = {
  nickname: string
  profileImageUrl?: string | null
}

const DEFAULT_NICKNAME = '하시'

export const getMypageProfileSummary =
  async (): Promise<MypageProfileSummary> => {
    const response = await request<ProfileSummaryResponse>(
      '/api/v1/users/me/profile-summary',
    )

    return {
      nickname: response?.nickname ?? DEFAULT_NICKNAME,
      profileImageUrl: response?.profileImageUrl ?? null,
    }
  }
