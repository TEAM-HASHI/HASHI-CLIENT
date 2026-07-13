import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  buildKakaoAuthorizeUrl,
  createKakaoOAuthState,
  saveKakaoOAuthState,
} from '@/features/auth/utils/kakaoOAuth'
import { navigateToExternalUrl } from '@/features/auth/utils/externalNavigation'

import { useKakaoOAuthStart } from '@/features/auth/hooks/useKakaoOAuthStart'

vi.mock('@/features/auth/utils/kakaoOAuth', () => ({
  buildKakaoAuthorizeUrl: vi.fn(),
  createKakaoOAuthState: vi.fn(),
  saveKakaoOAuthState: vi.fn(),
}))

vi.mock('@/features/auth/utils/externalNavigation', () => ({
  navigateToExternalUrl: vi.fn(),
}))

const mockedCreateKakaoOAuthState = vi.mocked(createKakaoOAuthState)
const mockedSaveKakaoOAuthState = vi.mocked(saveKakaoOAuthState)
const mockedBuildKakaoAuthorizeUrl = vi.mocked(buildKakaoAuthorizeUrl)
const mockedNavigateToExternalUrl = vi.mocked(navigateToExternalUrl)

describe('useKakaoOAuthStart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedCreateKakaoOAuthState.mockReturnValue({
      state: 'state-123',
      createdAt: 1,
      redirectTo: '/restaurants/1/reservations/new',
    })
    mockedSaveKakaoOAuthState.mockReturnValue(true)
    mockedBuildKakaoAuthorizeUrl.mockReturnValue('https://kauth.kakao.com')
  })

  it('stores OAuth state and moves to Kakao authorize URL', () => {
    const { result } = renderHook(() => useKakaoOAuthStart())

    act(() => {
      result.current.startKakaoOAuth('/restaurants/1/reservations/new')
    })

    expect(mockedCreateKakaoOAuthState).toHaveBeenCalledWith(
      '/restaurants/1/reservations/new',
    )
    expect(mockedSaveKakaoOAuthState).toHaveBeenCalledWith({
      state: 'state-123',
      createdAt: 1,
      redirectTo: '/restaurants/1/reservations/new',
    })
    expect(mockedBuildKakaoAuthorizeUrl).toHaveBeenCalledWith('state-123')
    expect(mockedNavigateToExternalUrl).toHaveBeenCalledWith(
      'https://kauth.kakao.com',
    )
  })

  it('does not navigate when OAuth state cannot be stored', () => {
    mockedSaveKakaoOAuthState.mockReturnValue(false)
    const { result } = renderHook(() => useKakaoOAuthStart())

    act(() => {
      result.current.startKakaoOAuth()
    })

    expect(mockedBuildKakaoAuthorizeUrl).not.toHaveBeenCalled()
    expect(mockedNavigateToExternalUrl).not.toHaveBeenCalled()
  })

  it('does not navigate when Kakao authorize URL cannot be built', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    mockedBuildKakaoAuthorizeUrl.mockImplementation(() => {
      throw new Error('VITE_KAKAO_CLIENT_ID 환경 변수가 필요합니다.')
    })
    const { result } = renderHook(() => useKakaoOAuthStart())

    act(() => {
      result.current.startKakaoOAuth()
    })

    expect(mockedNavigateToExternalUrl).not.toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      new Error('VITE_KAKAO_CLIENT_ID 환경 변수가 필요합니다.'),
    )

    consoleErrorSpy.mockRestore()
  })
})
