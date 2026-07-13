import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { getAuthMe } from '@/features/auth/api/getAuthMe'
import { requestKakaoLogin } from '@/features/auth/api/kakaoLogin'
import {
  clearAuthSession,
  setAccessToken,
  setOnboardingSession,
} from '@/features/auth/session/authSession'
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

  useEffect(() => {
    if (hasHandledCallbackRef.current) {
      return
    }

    hasHandledCallbackRef.current = true

    const processCallback = async () => {
      const code = searchParams.get('code')

      if (!code) {
        navigate(ROUTES.loginRequired, { replace: true })
        return
      }

      const oauthState = consumeKakaoOAuthState(searchParams.get('state'))

      if (!oauthState) {
        navigate(ROUTES.loginRequired, { replace: true })
        return
      }

      try {
        const loginResult = await requestKakaoLogin(code)

        if (!loginResult.registered) {
          setOnboardingSession()
          navigate(getProfileNewPath(oauthState.redirectTo), { replace: true })
          return
        }

        if (!loginResult.accessToken) {
          throw new Error('Authorization header is missing.')
        }

        const authMe = await getAuthMe(loginResult.accessToken)

        if (authMe.role !== 'USER') {
          throw new Error('Invalid user session.')
        }

        setAccessToken(loginResult.accessToken)
        navigate(oauthState.redirectTo ?? ROUTES.home, { replace: true })
      } catch {
        clearAuthSession()
        navigate(ROUTES.loginRequired, { replace: true })
      }
    }

    void processCallback()
  }, [navigate, searchParams])

  return <LoadingScreen message="로그인 중이에요" />
}
