import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AuthGateBottomSheet } from '@/features/auth/components/authGateBottomSheet/AuthGateBottomSheet'
import loginImage from '@/shared/assets/images/login.webp'

describe('AuthGateBottomSheet', () => {
  afterEach(() => {
    cleanup()
    document.body.style.overflow = ''
  })

  it('renders login prompt and kakao button', () => {
    render(
      <AuthGateBottomSheet
        open
        onKakaoPress={vi.fn()}
        onOpenChange={vi.fn()}
      />,
    )

    expect(screen.getByText('간편하게 로그인하고')).toBeInTheDocument()
    expect(
      screen.getByText('Hashi와 일본 미식 여행을 완성해보세요!'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '카카오로 로그인하기' }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('auth-gate-content')).toHaveClass(
      'relative',
      'h-[387px]',
    )
    expect(screen.getByText('간편하게 로그인하고')).toHaveClass(
      'typo-body-1',
      'leading-[29px]',
    )
    expect(
      screen.getByText('Hashi와 일본 미식 여행을 완성해보세요!'),
    ).toHaveClass('typo-header-3', 'leading-[1.5]')
    expect(screen.getByRole('presentation', { hidden: true })).toHaveAttribute(
      'src',
      loginImage,
    )
    expect(screen.getByRole('presentation', { hidden: true })).toHaveClass(
      'h-[172px]',
      'w-[201px]',
    )
    expect(
      screen.getByRole('button', { name: '카카오로 로그인하기' }),
    ).toHaveClass('h-12', 'w-[268px]')
  })

  it('keeps kakao brand color for active feedback', () => {
    render(
      <AuthGateBottomSheet
        open
        onKakaoPress={vi.fn()}
        onOpenChange={vi.fn()}
      />,
    )

    const kakaoButton = screen.getByRole('button', {
      name: '카카오로 로그인하기',
    })

    expect(kakaoButton).toHaveClass('bg-point-200')
    expect(kakaoButton).toHaveClass('enabled:active:bg-point-200')
    expect(kakaoButton).toHaveClass('enabled:active:opacity-80')
    expect(kakaoButton).not.toHaveClass('enabled:active:bg-cool-gray-300')
  })

  it('calls onKakaoPress when kakao button is pressed', () => {
    const handleKakaoPress = vi.fn()

    render(
      <AuthGateBottomSheet
        open
        onKakaoPress={handleKakaoPress}
        onOpenChange={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '카카오로 로그인하기' }))

    expect(handleKakaoPress).toHaveBeenCalled()
  })
})
