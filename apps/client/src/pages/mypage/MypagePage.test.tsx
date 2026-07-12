import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  HASHI_NOTICE_URL,
  HASHI_TERMS_URL,
} from '@/pages/mypage/constants/mypageMenu'
import { MypagePage } from '@/pages/mypage/MypagePage'

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('MypagePage', () => {
  afterEach(() => {
    cleanup()
    mockNavigate.mockClear()
  })

  it('renders primary action buttons with design token colors', () => {
    render(<MypagePage />)

    expect(screen.getByRole('button', { name: '수정' })).toHaveClass(
      'bg-cool-gray-800',
    )
    expect(screen.getByRole('button', { name: /내가 찜한 식당/ })).toHaveClass(
      'bg-cool-gray-800',
    )
  })

  it('renders saved restaurant count as zero during MVP', () => {
    render(<MypagePage />)

    expect(
      screen.getByRole('button', { name: /내가 찜한 식당 0/ }),
    ).toBeInTheDocument()
  })

  it('renders confirmed notice and terms links as external links', () => {
    render(<MypagePage />)

    expect(screen.getByRole('link', { name: '공지사항' })).toHaveAttribute(
      'href',
      HASHI_NOTICE_URL,
    )
    expect(screen.getByRole('link', { name: '이용약관' })).toHaveAttribute(
      'href',
      HASHI_TERMS_URL,
    )
  })

  it('does not render the MVP-excluded account section', () => {
    render(<MypagePage />)

    expect(screen.queryByText('계정')).not.toBeInTheDocument()
    expect(screen.queryByText('로그아웃')).not.toBeInTheDocument()
    expect(screen.queryByText('회원탈퇴')).not.toBeInTheDocument()
  })
})
