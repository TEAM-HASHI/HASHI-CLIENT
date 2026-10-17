import { useEffect, useState, type ReactNode } from 'react'

import { getShouldRenderDuringAuthRestore } from '@/app/providers/authSessionRestorePolicy'
import { getAuthMe } from '@/features/auth/api/getAuthMe'
import { requestTokenReissue } from '@/shared/api/requestTokenReissue'
import { checkIsAuthRequiredError } from '@/shared/api/apiError'
import {
  clearAuthSession,
  getAccessToken,
  getAuthSessionStatus,
  getAuthSessionVersion,
  setAccessToken,
  setOnboardingSession,
} from '@/shared/auth/authSession'

interface AuthSessionRestoreGateProps {
  children: ReactNode
  pathname?: string
}

let authSessionRestorePromise: Promise<void> | undefined

const getCurrentPathname = () => {
  if (typeof window === 'undefined') {
    return undefined
  }

  return window.location.pathname
}

const restoreAuthSessionOnce = async () => {
  const sessionVersion = getAuthSessionVersion()
  const canRestore = () =>
    getAuthSessionVersion() === sessionVersion &&
    getAuthSessionStatus() === 'unauthenticated'

  let accessToken: string | undefined

  try {
    const reissueResult = await requestTokenReissue()
    accessToken = reissueResult.accessToken
  } catch (cause) {
    if (!canRestore()) return
    if (!checkIsAuthRequiredError(cause)) throw cause
  }

  try {
    const authMe = await getAuthMe(accessToken)
    if (!canRestore()) return

    if (accessToken && authMe.role === 'USER') {
      setAccessToken(accessToken)
    } else if (!accessToken && authMe.role === 'ONBOARDING') {
      setOnboardingSession()
    } else {
      clearAuthSession()
    }
  } catch (cause) {
    if (!canRestore()) return
    if (!checkIsAuthRequiredError(cause)) throw cause
    clearAuthSession()
  }
}

const restoreAuthSession = async () => {
  if (!authSessionRestorePromise) {
    authSessionRestorePromise = restoreAuthSessionOnce().finally(() => {
      authSessionRestorePromise = undefined
    })
  }

  return authSessionRestorePromise
}

export const AuthSessionRestoreGate = ({
  children,
  pathname,
}: AuthSessionRestoreGateProps) => {
  const [isRestoreCompleted, setIsRestoreCompleted] = useState(() =>
    Boolean(getAccessToken()),
  )
  const [restoreError, setRestoreError] = useState<unknown>()
  const currentPathname = pathname ?? getCurrentPathname()
  const shouldRenderChildren =
    isRestoreCompleted ||
    Boolean(getAccessToken()) ||
    getShouldRenderDuringAuthRestore(currentPathname)

  useEffect(() => {
    if (getAccessToken()) {
      return
    }

    let isMounted = true

    const completeAuthSessionRestore = async () => {
      try {
        await restoreAuthSession()
      } catch (cause) {
        if (isMounted) setRestoreError(cause)
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

  if (restoreError) throw restoreError

  if (!shouldRenderChildren) {
    return null
  }

  return children
}
