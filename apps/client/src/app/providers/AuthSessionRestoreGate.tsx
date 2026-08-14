import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { getAuthMe } from '@/features/auth/api/getAuthMe'
import { requestTokenReissue } from '@/features/auth/api/reissueToken'
import { AuthSessionRestoreContext } from '@/features/auth/session/AuthSessionRestoreContext'
import {
  clearAuthSession,
  getAccessToken,
  setAccessToken,
  setOnboardingSession,
} from '@/features/auth/session/authSession'
import { getApiAccessToken } from '@/shared/api/accessToken'

interface AuthSessionRestoreGateProps {
  children: ReactNode
}

let authSessionRestorePromise: Promise<void> | undefined

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
  const [isRestoreCompleted, setIsRestoreCompleted] = useState(() =>
    Boolean(getAccessToken()),
  )
  const restoreContextValue = useMemo(
    () => ({ isRestoring: !isRestoreCompleted }),
    [isRestoreCompleted],
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

  return (
    <AuthSessionRestoreContext.Provider value={restoreContextValue}>
      {children}
    </AuthSessionRestoreContext.Provider>
  )
}
