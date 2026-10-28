import '@testing-library/jest-dom/vitest'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LoginRequiredPage } from '@/pages/loginRequired/LoginRequiredPage'
import {
  clearMapSession,
  writeMapSession,
  persistMapSessionForOAuth,
} from '@/pages/map/utils/mapSession'

const { mockStartKakaoOAuth } = vi.hoisted(() => ({
  mockStartKakaoOAuth: vi.fn(),
}))

vi.mock('@/features/auth/hooks/useKakaoOAuthStart', () => ({
  useKakaoOAuthStart: () => ({
    startKakaoOAuth: mockStartKakaoOAuth,
  }),
}))

describe('LoginRequiredPage', () => {
  afterEach(() => {
    cleanup()
    clearMapSession()
    mockStartKakaoOAuth.mockClear()
  })

  it('starts OAuth without a map checkpoint for a non-map entry', () => {
    writeMapSession({
      conditions: {
        keyword: '',
        category: 'all',
        sort: 'recommended',
        areaCode: null,
      },
      camera: null,
      searchBounds: null,
      selectedId: null,
      stage: 'normal',
      detailStage: 'normal',
      isExploring: false,
    })
    persistMapSessionForOAuth()
    render(
      <MemoryRouter>
        <LoginRequiredPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: '카카오로 로그인하기' }))

    expect(mockStartKakaoOAuth).toHaveBeenCalledOnce()
    expect(sessionStorage.getItem('hashi:map:oauth-resume:v1')).toBeNull()
  })

  it('checkpoints the map only when the map-origin login button is pressed', () => {
    writeMapSession({
      conditions: {
        keyword: '',
        category: 'restaurant',
        sort: 'rating',
        areaCode: null,
      },
      camera: null,
      searchBounds: null,
      selectedId: '10',
      stage: 'normal',
      detailStage: 'expanded',
      isExploring: true,
    })
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/login-required',
            state: { from: { pathname: '/map' } },
          },
        ]}
      >
        <LoginRequiredPage />
      </MemoryRouter>,
    )
    expect(sessionStorage.getItem('hashi:map:oauth-resume:v1')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '카카오로 로그인하기' }))
    expect(
      JSON.parse(sessionStorage.getItem('hashi:map:oauth-resume:v1')!).snapshot
        .selectedId,
    ).toBe('10')
    expect(mockStartKakaoOAuth).toHaveBeenCalledWith('/map')
  })
})
