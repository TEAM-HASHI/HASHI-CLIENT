import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api/request'

export type AuthMe = components['schemas']['AuthMeResponse']

export const getAuthMe = async (accessToken: string) => {
  return request<AuthMe>('api/v1/auth/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
  })
}
