import { request } from '@/shared/api/request'

export interface UpdateProfileBody {
  nickname?: string
  birthDate?: string
  phone?: string
  email?: string
  profileImageAssetId?: string
}

export const updateProfile = async (
  body: UpdateProfileBody,
  signal: AbortSignal,
) => {
  await request('api/v1/users/me', {
    method: 'patch',
    json: body,
    credentials: 'include',
    signal,
  })
}

export const deleteProfileImage = async (signal: AbortSignal) => {
  await request('api/v1/users/me/profile-image', {
    method: 'delete',
    credentials: 'include',
    signal,
  })
}
