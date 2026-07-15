import { useEffect, useState, type ReactNode } from 'react'

import { ROUTES } from '@/app/router/path'
import { getAuthMe } from '@/features/auth/api/getAuthMe'
import { requestTokenReissue } from '@/features/auth/api/reissueToken'
import {
  clearAuthSession,
  getAccessToken,
  setAccessToken,
  setOnboardingSession,
} from '@/features/auth/session/authSession'
import { getApiAccessToken } from '@/shared/api/accessToken'
import { LoadingScreen } from '@/shared/components/loadingScreen'

interface AuthSessionRestoreGateProps {
  children: ReactNode
}

let authSessionRestorePromise: Promise<void> | undefined

const AUTH_RESTORE_NON_BLOCKING_PATHS = new Set<string>([
  ROUTES.home,
  ROUTES.hashiPickRestaurants,
  ROUTES.popularRestaurants,
  ROUTES.magazines,
])

const RESTAURANT_DETAIL_PATH_PATTERN = /^\/restaurants\/[1-9]\d*$/

const getShouldRenderDuringAuthRestore = () => {
  if (typeof window === 'undefined') {
    return true
  }

  return (
    AUTH_RESTORE_NON_BLOCKING_PATHS.has(window.location.pathname) ||
    RESTAURANT_DETAIL_PATH_PATTERN.test(window.location.pathname)
  )
}

const restoreUserSession = async (accessToken: string) => {
  const authMe = await getAuthMe(accessToken)

  if (authMe.role !== 'USER') {
    throw new Error('Invalid user session.')
  }

  setAccessToken(accessToken)
}

const restoreAuthSessionOnce = async () => {
  const developmentAccessToken = getApiAccessToken()

  if (developmentAccessToken) {
    await restoreUserSession(developmentAccessToken)
    return
  }

  let accessToken: string

  try {
    const reissueResult = await requestTokenReissue()
    accessToken = reissueResult.accessToken
  } catch {
    const authMe = await getAuthMe()

    if (authMe.role !== 'ONBOARDING') {
      throw new Error('Invalid onboarding session.')
    }

    setOnboardingSession()
    return
  }

  await restoreUserSession(accessToken)
}

const restoreAuthSession = async () => {
  if (!authSessionRestorePromise) {
    authSessionRestorePromise = restoreAuthSessionOnce()
      .catch((cause) => {
        clearAuthSession()
        throw cause
      })
      .finally(() => {
        authSessionRestorePromise = undefined
      })
  }

  return authSessionRestorePromise
}

export const AuthSessionRestoreGate = ({
  children,
}: AuthSessionRestoreGateProps) => {
  const [isRestoreCompleted, setIsRestoreCompleted] = useState(
    () => Boolean(getAccessToken()) || getShouldRenderDuringAuthRestore(),
  )

  useEffect(() => {
    if (getAccessToken()) {
      return
    }

    let isMounted = true

    const completeAuthSessionRestore = async () => {
      try {
        await restoreAuthSession()
      } catch {
        // Missing or invalid user/onboarding credentials are logged-out startup.
      } finally {
        if (isMounted) {
          setIsRestoreCompleted(true)
        }
      }
    }

    void completeAuthSessionRestore()

    return () => {
      isMounted = false
    }
  }, [])

  if (!isRestoreCompleted) {
    return <LoadingScreen message="로그인 상태를 확인하고 있어요" />
  }

  return children
}
