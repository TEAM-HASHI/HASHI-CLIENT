import { request } from '@/shared/api/request'
import type { components } from '@/shared/api/generated/openapi'

export type UpdateProfileBody = components['schemas']['UpdateMyInfoRequest']

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
