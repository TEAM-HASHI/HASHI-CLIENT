import type { components } from '@/shared/api/generated/openapi'
import type { paths as UserApiPaths } from '@/shared/api/generated/user-openapi'
import { apiClient } from '@/shared/api/apiClient'
import { parseAdminApiResponse } from '@/shared/api/apiResponse'
import type { AdminSession } from '@/shared/auth/adminSession'

export type AdminLoginBody = components['schemas']['AdminLoginRequest']

const LOGIN_PATH = 'api/v1/auth/admin/login'
const LOGOUT_PATH = 'api/v1/auth/admin/logout'
const REISSUE_OPENAPI_PATH = '/api/v1/auth/reissue' satisfies keyof UserApiPaths
const REISSUE_PATH = REISSUE_OPENAPI_PATH.replace(/^\/+/, '')

const getAccessToken = (response: Response) => {
  const authorization = response.headers.get('Authorization')?.trim()
  const accessToken = authorization?.replace(/^Bearer\s+/i, '').trim()

  if (!accessToken) {
    throw new Error('로그인 응답에 access token이 없습니다.')
  }

  return accessToken
}

export const authApi = {
  async login(body: AdminLoginBody): Promise<AdminSession> {
    const response = await apiClient.post(LOGIN_PATH, {
      credentials: 'include',
      json: body,
    })

    await parseAdminApiResponse<unknown>(response)

    return {
      accessToken: getAccessToken(response),
      issuedAt: new Date().toISOString(),
      loginId: body.loginId,
    }
  },
  async logout() {
    const response = await apiClient.post(LOGOUT_PATH, {
      credentials: 'include',
    })

    await parseAdminApiResponse<unknown>(response)
  },
  async reissue() {
    const response = await apiClient.post(REISSUE_PATH, {
      credentials: 'include',
    })

    await parseAdminApiResponse<unknown>(response)

    return getAccessToken(response)
  },
}
