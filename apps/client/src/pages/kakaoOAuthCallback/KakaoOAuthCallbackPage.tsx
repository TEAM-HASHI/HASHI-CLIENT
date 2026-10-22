import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { getAuthMe } from '@/features/auth/api/getAuthMe'
import { requestKakaoLogin } from '@/features/auth/api/kakaoLogin'
import {
  clearAuthSession,
  getAuthSessionVersion,
  startAuthenticatedSession,
  setOnboardingSession,
} from '@/shared/auth/authSession'
import { consumeKakaoOAuthState } from '@/features/auth/utils/kakaoOAuth'
import { LoadingScreen } from '@/shared/components/loadingScreen'

const getProfileNewPath = (redirectTo?: string) => {
  if (!redirectTo) {
    return ROUTES.profileNew
  }

  return `${ROUTES.profileNew}?redirectTo=${encodeURIComponent(redirectTo)}`
}

export const KakaoOAuthCallbackPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const hasHandledCallbackRef = useRef(false)
  const callbackSearch = searchParams.toString()
  const activeCallbackRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    activeCallbackRef.current = callbackSearch
    return () => {
      activeCallbackRef.current = undefined
    }
  }, [callbackSearch])

  useEffect(() => {
    if (hasHandledCallbackRef.current) {
      return
    }

    hasHandledCallbackRef.current = true
    const sessionVersion = getAuthSessionVersion()
    const isCurrentCallback = () =>
      activeCallbackRef.current === callbackSearch &&
      getAuthSessionVersion() === sessionVersion

    const processCallback = async () => {
      const callbackParams = new URLSearchParams(callbackSearch)
      const code = callbackParams.get('code')

      if (!code) {
        navigate(ROUTES.loginRequired, { replace: true })
        return
      }

      const oauthState = consumeKakaoOAuthState(callbackParams.get('state'))

      if (!oauthState) {
        navigate(ROUTES.loginRequired, { replace: true })
        return
      }

      try {
        const loginResult = await requestKakaoLogin(code)
        if (!isCurrentCallback()) return

        if (!loginResult.registered) {
          setOnboardingSession()
          navigate(getProfileNewPath(oauthState.redirectTo), { replace: true })
          return
        }

        if (!loginResult.accessToken) {
          throw new Error('Authorization header is missing.')
        }

        const authMe = await getAuthMe(loginResult.accessToken)
        if (!isCurrentCallback()) return

        if (authMe.role !== 'USER') {
          throw new Error('Invalid user session.')
        }

        startAuthenticatedSession(
          loginResult.accessToken,
          authMe.subjectId ?? undefined,
        )
        navigate(oauthState.redirectTo ?? ROUTES.home, { replace: true })
      } catch {
        if (!isCurrentCallback()) return
        clearAuthSession()
        navigate(ROUTES.loginRequired, { replace: true })
      }
    }

    void processCallback()
  }, [navigate, callbackSearch])

  return <LoadingScreen message="로그인 중이에요" />
}
