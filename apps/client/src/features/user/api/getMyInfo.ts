import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

type MyInfoResponse = components['schemas']['MyInfoResponse']

export type MyInfo = {
  nickname: string
  englishName?: string
  birthDate: string
  phoneNumber: string
  email: string
  profileImageUrl?: string | null
}

export const getMyInfo = async (): Promise<MyInfo> => {
  const response = await request<MyInfoResponse>('/api/v1/users/me')

  if (
    !response?.nickname ||
    !response.birthDate ||
    !response.phone ||
    !response.email
  ) {
    throw new Error('Missing my profile information')
  }

  return {
    nickname: response.nickname,
    englishName: response.nameEng,
    birthDate: response.birthDate,
    phoneNumber: response.phone,
    email: response.email,
    profileImageUrl: response.profileImageUrl ?? null,
  }
}
