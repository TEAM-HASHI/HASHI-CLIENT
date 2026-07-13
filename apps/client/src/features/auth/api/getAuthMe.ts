import { request } from '@/shared/api/request'

export type AuthRole = 'ADMIN' | 'ONBOARDING' | 'USER'

export interface AuthMe {
  role: AuthRole
  subjectId?: number | null
}

const checkIsAuthMe = (value: unknown): value is AuthMe => {
  if (typeof value !== 'object' || value === null || !('role' in value)) {
    return false
  }

  if (value.role === 'ONBOARDING') {
    return !('subjectId' in value) || value.subjectId == null
  }

  return (
    (value.role === 'USER' || value.role === 'ADMIN') &&
    'subjectId' in value &&
    typeof value.subjectId === 'number' &&
    Number.isSafeInteger(value.subjectId) &&
    value.subjectId > 0
  )
}

export const getAuthMe = async (accessToken?: string) => {
  const authMe = await request<AuthMe>('api/v1/auth/me', {
    ...(accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : {}),
    credentials: 'include',
  })

  if (!checkIsAuthMe(authMe)) {
    throw new Error('Invalid API response', { cause: authMe })
  }

  return authMe
}
