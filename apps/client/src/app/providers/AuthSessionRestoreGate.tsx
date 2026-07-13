import { useEffect, useState, type ReactNode } from 'react'

import { requestTokenReissue } from '@/features/auth/api/reissueToken'
import {
  clearAuthSession,
  getAccessToken,
  setAccessToken,
} from '@/features/auth/session/authSession'

interface AuthSessionRestoreGateProps {
  children: ReactNode
}

let authSessionRestorePromise: Promise<string> | undefined

const restoreAuthSession = async () => {
  if (!authSessionRestorePromise) {
    authSessionRestorePromise = requestTokenReissue()
      .then(({ accessToken }) => {
        setAccessToken(accessToken)
        return accessToken
      })
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

  useEffect(() => {
    if (getAccessToken()) {
      return
    }

    let isMounted = true

    const completeAuthSessionRestore = async () => {
      try {
        await restoreAuthSession()
      } catch {
        // Missing or invalid refresh cookies are treated as logged-out startup.
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
    return null
  }

  return children
}
