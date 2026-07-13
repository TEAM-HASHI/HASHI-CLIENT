import { useSyncExternalStore } from 'react'

import {
  getAuthSessionStatus,
  subscribeAuthSession,
  type AuthSessionStatus,
} from '@/features/auth/session/authSession'

export type AuthStatus = AuthSessionStatus

export const useAuthStatus = (): {
  isAuthenticated: boolean
  isOnboarding: boolean
  status: AuthStatus
} => {
  const status = useSyncExternalStore(
    subscribeAuthSession,
    getAuthSessionStatus,
    getAuthSessionStatus,
  )

  return {
    isAuthenticated: status === 'authenticated',
    isOnboarding: status === 'onboarding',
    status,
  }
}
