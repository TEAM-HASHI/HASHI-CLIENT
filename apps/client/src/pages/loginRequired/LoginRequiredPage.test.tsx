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

  it('keeps the login guidance copy in the QA layout and starts OAuth', () => {
    render(
      <MemoryRouter>
        <LoginRequiredPage />
      </MemoryRouter>,
    )

    const graphic = screen.getByRole('presentation', { hidden: true })

    expect(graphic).toHaveAttribute('src', emptyImage)
    expect(graphic).toHaveClass('h-19', 'w-[101px]')
    expect(
      screen.getByRole('heading', {
        name: 'Hashi와 함께 예약을 시작해보세요!',
      }),
    ).toHaveClass('typo-sub-header-1')
    expect(screen.getByText(/로그인하면 예약 현황을/)).toHaveClass(
      'typo-body-8',
      'leading-[1.2]',
    )

    fireEvent.click(screen.getByRole('button', { name: '카카오로 로그인하기' }))

    expect(mockStartKakaoOAuth).toHaveBeenCalledOnce()
  })
})
