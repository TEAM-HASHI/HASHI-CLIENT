import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

type ProfileSummaryResponse = components['schemas']['ProfileSummaryResponse']

type MypageProfileSummary = {
  nickname: string
  profileImageUrl?: string | null
}

export const getMypageProfileSummary =
  async (): Promise<MypageProfileSummary> => {
    const response = await request<ProfileSummaryResponse>(
      '/api/v1/users/me/profile-summary',
    )

    if (!response?.nickname) {
      throw new Error('Missing mypage profile nickname')
    }

    return {
      nickname: response.nickname,
      profileImageUrl: response?.profileImageUrl ?? null,
    }
  }
