import { useEffect, useState, type ReactNode } from 'react'
import { showToast } from '@hashi/hds-ui'

import { getShouldRenderDuringAuthRestore } from '@/app/providers/authSessionRestorePolicy'
import { getAuthMe } from '@/features/auth/api/getAuthMe'
import { requestTokenReissue } from '@/shared/api/requestTokenReissue'
import { checkIsAuthRequiredError } from '@/shared/api/apiError'
import { getErrorPresentation } from '@/shared/api/errorPresentation'
import { captureError } from '@/shared/lib/sentry'
import { queryClient } from '@/shared/lib/queryClient'
import {
  clearAuthSession,
  getAccessToken,
  getAuthSessionStatus,
  getAuthSessionVersion,
  getAuthSubjectId,
  setAccessToken,
  setOnboardingSession,
  startAuthenticatedSession,
} from '@/shared/auth/authSession'

interface AuthSessionRestoreGateProps {
  children: ReactNode
  pathname?: string
}

let authSessionRestore:
  | { sessionVersion: number; promise: Promise<void> }
  | undefined

const getCurrentPathname = () => {
  if (typeof window === 'undefined') {
    return undefined
  }

  return window.location.pathname
}

const restoreAuthSessionOnce = async (revalidate: boolean) => {
  const sessionVersion = getAuthSessionVersion()
  const previousToken = getAccessToken()
  const previousStatus = getAuthSessionStatus()
  const previousSubjectId = getAuthSubjectId()
  const canRestore = () =>
    getAuthSessionVersion() === sessionVersion &&
    getAccessToken() === previousToken &&
    getAuthSessionStatus() === previousStatus

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
      const accountChanged =
        previousStatus === 'authenticated' &&
        previousSubjectId !== authMe.subjectId
      if (
        revalidate &&
        (previousStatus !== 'authenticated' || accountChanged)
      ) {
        startAuthenticatedSession(accessToken, authMe.subjectId ?? undefined)
      } else {
        setAccessToken(accessToken, authMe.subjectId ?? undefined)
      }
      if (accountChanged) {
        queryClient.removeQueries({ type: 'inactive' })
        queryClient.getMutationCache().clear()
        void queryClient.resetQueries({ type: 'active' })
      }
    } else if (!accessToken && authMe.role === 'ONBOARDING') {
      setOnboardingSession()
    } else {
      clearAuthSession()
    }
  } catch (cause) {
    if (!canRestore()) return
    if (!checkIsAuthRequiredError(cause)) throw cause
    clearAuthSession(previousStatus === 'authenticated' ? 'expired' : undefined)
  }
}

const restoreAuthSession = (revalidate: boolean) => {
  const sessionVersion = getAuthSessionVersion()
  if (authSessionRestore?.sessionVersion !== sessionVersion) {
    const promise = restoreAuthSessionOnce(revalidate).finally(() => {
      if (authSessionRestore?.promise === promise)
        authSessionRestore = undefined
    })
    authSessionRestore = { sessionVersion, promise }
  }

  return authSessionRestore.promise
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
    let isMounted = true

    const completeAuthSessionRestore = async (revalidate = false) => {
      try {
        await restoreAuthSession(revalidate)
      } catch (cause) {
        if (!isMounted) return
        if (revalidate) {
          captureError(cause)
          showToast({ children: getErrorPresentation(cause).message })
        } else {
          setRestoreError(cause)
        }
      } finally {
        if (isMounted) {
          setIsRestoreCompleted(true)
        }
      }
    }

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) void completeAuthSessionRestore(true)
    }
    window.addEventListener('pageshow', handlePageShow)
    if (!getAccessToken()) void completeAuthSessionRestore()

    return () => {
      isMounted = false
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [])

  if (restoreError) throw restoreError

  if (!shouldRenderChildren) {
    return null
  }

  return children
}
