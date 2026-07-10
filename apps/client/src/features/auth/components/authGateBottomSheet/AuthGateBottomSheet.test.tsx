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
      screen.getByRole('button', { name: '카카오로 1초 만에 시작하기' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('presentation', { hidden: true })).toHaveAttribute(
      'src',
      loginImage,
    )
    expect(screen.getByRole('presentation', { hidden: true })).toHaveAttribute(
      'width',
      '200',
    )
    expect(screen.getByRole('presentation', { hidden: true })).toHaveClass(
      'h-auto',
    )
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

    fireEvent.click(
      screen.getByRole('button', { name: '카카오로 1초 만에 시작하기' }),
    )

    expect(handleKakaoPress).toHaveBeenCalled()
  })
})
