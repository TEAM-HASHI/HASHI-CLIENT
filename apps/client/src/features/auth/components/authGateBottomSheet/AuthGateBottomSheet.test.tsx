import '@testing-library/jest-dom/vitest'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AuthGateBottomSheet } from '@/features/auth/components/authGateBottomSheet/AuthGateBottomSheet'
import loginImage from '@/shared/assets/images/login.webp'
import {
  clearAuthSession,
  startAuthenticatedSession,
} from '@/shared/auth/authSession'

describe('AuthGateBottomSheet', () => {
  afterEach(() => {
    cleanup()
    clearAuthSession()
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
    expect(screen.getByRole('presentation', { hidden: true })).toHaveAttribute(
      'src',
      loginImage,
    )
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

  it('hides a restored login prompt when the session becomes authenticated without losing the draft', async () => {
    render(
      <>
        <input aria-label="draft" defaultValue="unsaved" />
        <AuthGateBottomSheet
          open
          onKakaoPress={vi.fn()}
          onOpenChange={vi.fn()}
        />
      </>,
    )
    const input = screen.getByRole('textbox', { name: 'draft' })
    expect(
      screen.getByRole('dialog', { name: '로그인 안내' }),
    ).toBeInTheDocument()
    act(() => startAuthenticatedSession('restored-cookie-token'))
    fireEvent.animationEnd(screen.getByRole('dialog', { name: '로그인 안내' }))
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: '로그인 안내' }),
      ).not.toBeInTheDocument(),
    )
    expect(screen.getByRole('textbox', { name: 'draft' })).toBe(input)
    expect(input).toHaveValue('unsaved')
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
