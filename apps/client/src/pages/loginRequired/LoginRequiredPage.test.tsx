import '@testing-library/jest-dom/vitest'

import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LoginRequiredPage } from '@/pages/loginRequired/LoginRequiredPage'
import emptyImage from '@/shared/assets/images/empty.webp'

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
    mockStartKakaoOAuth.mockClear()
  })

  it('renders the login guidance and starts OAuth', () => {
    render(
      <MemoryRouter>
        <LoginRequiredPage />
      </MemoryRouter>,
    )

    const graphic = screen.getByRole('presentation', { hidden: true })

    expect(graphic).toHaveAttribute('src', emptyImage)
    expect(
      screen.getByRole('heading', {
        name: 'Hashi와 함께 예약을 시작해보세요!',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/더 편한 Hashi 이용을 위해/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '카카오로 로그인하기' }))

    expect(mockStartKakaoOAuth).toHaveBeenCalledOnce()
  })
})
