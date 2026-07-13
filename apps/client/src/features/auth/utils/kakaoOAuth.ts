import {
  KAKAO_AUTHORIZE_URL,
  KAKAO_OAUTH_STATE_STORAGE_KEY,
} from '@/features/auth/constants/oauth'

export interface KakaoOAuthState {
  state: string
  createdAt: number
  redirectTo?: string
}

const createRandomState = () => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }

  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.getRandomValues === 'function'
  ) {
    const randomValues = new Uint32Array(4)
    crypto.getRandomValues(randomValues)

    return Array.from(randomValues, (value) => value.toString(36)).join('')
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

const parseKakaoOAuthState = (
  storedValue: string | null,
): KakaoOAuthState | undefined => {
  if (!storedValue) {
    return undefined
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue)

    if (
      typeof parsedValue !== 'object' ||
      parsedValue === null ||
      !('state' in parsedValue) ||
      !('createdAt' in parsedValue) ||
      typeof parsedValue.state !== 'string' ||
      typeof parsedValue.createdAt !== 'number'
    ) {
      return undefined
    }

    return {
      state: parsedValue.state,
      createdAt: parsedValue.createdAt,
      redirectTo:
        'redirectTo' in parsedValue &&
        typeof parsedValue.redirectTo === 'string'
          ? parsedValue.redirectTo
          : undefined,
    }
  } catch {
    return undefined
  }
}

const removeStoredKakaoOAuthState = () => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.sessionStorage.removeItem(KAKAO_OAUTH_STATE_STORAGE_KEY)
  } catch {
    // OAuth state is single-use; storage cleanup failure should not break rendering.
  }
}

const getRequiredKakaoOAuthEnv = (key: string, value: string | undefined) => {
  const normalizedValue = value?.trim()

  if (
    !normalizedValue ||
    normalizedValue === 'undefined' ||
    normalizedValue === 'null'
  ) {
    throw new Error(`${key} 환경 변수가 필요합니다.`)
  }

  return normalizedValue
}

export const createKakaoOAuthState = (redirectTo?: string): KakaoOAuthState => {
  return {
    state: createRandomState(),
    createdAt: Date.now(),
    redirectTo,
  }
}

export const buildKakaoAuthorizeUrl = (state: string) => {
  const authorizeUrl = new URL(KAKAO_AUTHORIZE_URL)
  const clientId = getRequiredKakaoOAuthEnv(
    'VITE_KAKAO_CLIENT_ID',
    import.meta.env.VITE_KAKAO_CLIENT_ID,
  )
  const redirectUri = getRequiredKakaoOAuthEnv(
    'VITE_KAKAO_REDIRECT_URI',
    import.meta.env.VITE_KAKAO_REDIRECT_URI,
  )

  authorizeUrl.searchParams.set('client_id', clientId)
  authorizeUrl.searchParams.set('redirect_uri', redirectUri)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('state', state)

  return authorizeUrl.toString()
}

export const saveKakaoOAuthState = (oauthState: KakaoOAuthState) => {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    window.sessionStorage.setItem(
      KAKAO_OAUTH_STATE_STORAGE_KEY,
      JSON.stringify(oauthState),
    )

    return true
  } catch {
    return false
  }
}

export const consumeKakaoOAuthState = (returnedState: string | null) => {
  if (typeof window === 'undefined') {
    return undefined
  }

  let storedState: KakaoOAuthState | undefined

  try {
    storedState = parseKakaoOAuthState(
      window.sessionStorage.getItem(KAKAO_OAUTH_STATE_STORAGE_KEY),
    )
  } catch {
    storedState = undefined
  }

  removeStoredKakaoOAuthState()

  if (!storedState || storedState.state !== returnedState) {
    return undefined
  }

  return storedState
}
