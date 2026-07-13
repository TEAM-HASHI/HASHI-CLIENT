import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  buildKakaoAuthorizeUrl,
  consumeKakaoOAuthState,
  createKakaoOAuthState,
  saveKakaoOAuthState,
} from '@/features/auth/utils/kakaoOAuth'

describe('kakaoOAuth utilities', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    vi.stubEnv('VITE_KAKAO_CLIENT_ID', 'kakao-client-id')
    vi.stubEnv(
      'VITE_KAKAO_REDIRECT_URI',
      'http://localhost:5174/oauth/callback/kakao',
    )
  })

  it('builds Kakao authorize URL with required query params', () => {
    const authorizeUrl = new URL(buildKakaoAuthorizeUrl('state-123'))

    expect(authorizeUrl.origin).toBe('https://kauth.kakao.com')
    expect(authorizeUrl.pathname).toBe('/oauth/authorize')
    expect(authorizeUrl.searchParams.get('client_id')).toBe('kakao-client-id')
    expect(authorizeUrl.searchParams.get('redirect_uri')).toBe(
      'http://localhost:5174/oauth/callback/kakao',
    )
    expect(authorizeUrl.searchParams.get('response_type')).toBe('code')
    expect(authorizeUrl.searchParams.get('state')).toBe('state-123')
  })

  it('throws when Kakao client id env is missing', () => {
    vi.stubEnv('VITE_KAKAO_CLIENT_ID', '')

    expect(() => buildKakaoAuthorizeUrl('state-123')).toThrow(
      'VITE_KAKAO_CLIENT_ID 환경 변수가 필요합니다.',
    )
  })

  it('throws when Kakao redirect URI env is missing', () => {
    vi.stubEnv('VITE_KAKAO_REDIRECT_URI', '')

    expect(() => buildKakaoAuthorizeUrl('state-123')).toThrow(
      'VITE_KAKAO_REDIRECT_URI 환경 변수가 필요합니다.',
    )
  })

  it('saves and consumes matching OAuth state with redirect target', () => {
    const oauthState = createKakaoOAuthState('/restaurants/1/reservations/new')

    expect(saveKakaoOAuthState(oauthState)).toBe(true)

    expect(consumeKakaoOAuthState(oauthState.state)).toEqual(oauthState)
    expect(consumeKakaoOAuthState(oauthState.state)).toBeUndefined()
  })

  it('clears stored state when returned state does not match', () => {
    const oauthState = createKakaoOAuthState()

    expect(saveKakaoOAuthState(oauthState)).toBe(true)

    expect(consumeKakaoOAuthState('different-state')).toBeUndefined()
    expect(consumeKakaoOAuthState(oauthState.state)).toBeUndefined()
  })

  it('returns false when sessionStorage cannot persist OAuth state', () => {
    const unavailableStorage = {
      setItem: () => {
        throw new Error('sessionStorage unavailable')
      },
    } satisfies Pick<Storage, 'setItem'>

    expect(
      saveKakaoOAuthState(createKakaoOAuthState(), unavailableStorage),
    ).toBe(false)
  })

  it('returns false when accessing sessionStorage itself throws', () => {
    const sessionStorageGetter = vi
      .spyOn(window, 'sessionStorage', 'get')
      .mockImplementation(() => {
        throw new DOMException('Blocked', 'SecurityError')
      })

    expect(saveKakaoOAuthState(createKakaoOAuthState())).toBe(false)

    sessionStorageGetter.mockRestore()
  })
})
