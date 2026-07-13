import { useCallback } from 'react'

import {
  buildKakaoAuthorizeUrl,
  createKakaoOAuthState,
  saveKakaoOAuthState,
} from '@/features/auth/utils/kakaoOAuth'
import { navigateToExternalUrl } from '@/features/auth/utils/externalNavigation'

export const useKakaoOAuthStart = () => {
  const startKakaoOAuth = useCallback((redirectTo?: string) => {
    const oauthState = createKakaoOAuthState(redirectTo)

    if (!saveKakaoOAuthState(oauthState)) {
      return
    }

    try {
      navigateToExternalUrl(buildKakaoAuthorizeUrl(oauthState.state))
    } catch (error) {
      console.error(error)
    }
  }, [])

  return {
    startKakaoOAuth,
  }
}
