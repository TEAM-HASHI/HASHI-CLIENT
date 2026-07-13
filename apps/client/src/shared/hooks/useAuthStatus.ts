import {
  getAuthSessionStatus,
  type AuthSessionStatus,
} from '@/features/auth/session/authSession'

export type AuthStatus = AuthSessionStatus

export const useAuthStatus = (): {
  isAuthenticated: boolean
  isOnboarding: boolean
  status: AuthStatus
} => {
  const status = getAuthSessionStatus()

  return {
    isAuthenticated: status === 'authenticated',
    isOnboarding: status === 'onboarding',
    status,
  }
}
