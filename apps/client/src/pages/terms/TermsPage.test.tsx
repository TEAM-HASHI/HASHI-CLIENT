import '@testing-library/jest-dom/vitest'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TermsPage } from '@/pages/terms/TermsPage'

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return { ...actual, useNavigate: () => mockNavigate }
})

describe('TermsPage', () => {
  afterEach(() => {
    cleanup()
    mockNavigate.mockClear()
  })

  it('renders the eight current policies with their effective dates', () => {
    render(<TermsPage />)

    expect(screen.getByText('이용약관')).toBeInTheDocument()

    const rows = screen.getAllByRole('button', { name: /2026\.06\.29$/ })

    expect(rows.map((row) => row.textContent)).toEqual([
      '[Hashi 이용약관]2026.06.29',
      '[개인정보처리방침]2026.06.29',
      '[개인정보 수집 및 이용 동의]2026.06.29',
      '[개인정보 제3자 제공 동의]2026.06.29',
      '[예약 및 취소·환불 정책]2026.06.29',
      '[리뷰 운영정책]2026.06.29',
      '[포인트 이용약관]2026.06.29',
      '[서비스 운영정책]2026.06.29',
    ])
    expect(
      screen.getByText('이메일: hashiservice@gmail.com'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('문의 채널: Hashi 카카오톡 채널'),
    ).toBeInTheDocument()
  })

  it('navigates to the policy detail when a row is pressed', () => {
    render(<TermsPage />)

    fireEvent.click(
      screen.getByRole('button', {
        name: '[예약 및 취소·환불 정책] 2026.06.29',
      }),
    )

    expect(mockNavigate).toHaveBeenCalledWith('/terms/refund-policy')
  })

  it('goes back when the back button is pressed', () => {
    render(<TermsPage />)

    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))

    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })
})
