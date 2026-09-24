import '@testing-library/jest-dom/vitest'

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TermsDetailPage } from '@/pages/termsDetail/TermsDetailPage'

const { mockNavigate, mockParams } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockParams: { policyId: 'hashi-terms' } as { policyId?: string },
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  }
})

describe('TermsDetailPage', () => {
  afterEach(() => {
    cleanup()
    mockNavigate.mockClear()
    mockParams.policyId = 'hashi-terms'
  })

  it('renders the policy title, last update date, and collapsed clauses', () => {
    render(<TermsDetailPage />)

    expect(screen.getByText('Hashi 이용약관')).toBeInTheDocument()
    expect(screen.getByText('최종 업데이트: 2026. 06. 29')).toBeInTheDocument()

    const clauseButtons = screen.getAllByRole('button', { expanded: false })

    expect(clauseButtons).toHaveLength(14)
    expect(clauseButtons[0]).toHaveTextContent('제1조 (목적)')
    expect(clauseButtons[13]).toHaveTextContent('제14조 (준거법 및 관할)')
    expect(
      screen.getByText(/본 약관은 Hashi\(이하 “서비스”\)가 제공하는/),
    ).not.toBeVisible()
  })

  it('expands a clause to show its paragraphs and nested lists', () => {
    mockParams.policyId = 'privacy-policy'

    render(<TermsDetailPage />)

    fireEvent.click(
      screen.getByRole('button', { name: '제6조 (개인정보 처리의 위탁)' }),
    )

    const clauseButton = screen.getByRole('button', {
      name: '제6조 (개인정보 처리의 위탁)',
    })
    const content = document.getElementById(
      clauseButton.getAttribute('aria-controls') ?? '',
    )

    expect(clauseButton).toHaveAttribute('aria-expanded', 'true')
    expect(content).toBeVisible()
    expect(
      within(content as HTMLElement).getByText('카카오'),
    ).toBeInTheDocument()
    expect(
      within(content as HTMLElement).getByText(
        '위탁 목적: 카카오 로그인 및 알림 연동',
      ),
    ).toBeInTheDocument()
  })

  it('renders the not found page for an unknown policy id', () => {
    mockParams.policyId = 'unknown-policy'

    render(<TermsDetailPage />)

    expect(
      screen.getByRole('heading', { name: '404 페이지' }),
    ).toBeInTheDocument()
  })

  it('goes back when the back button is pressed', () => {
    render(<TermsDetailPage />)

    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))

    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })
})
