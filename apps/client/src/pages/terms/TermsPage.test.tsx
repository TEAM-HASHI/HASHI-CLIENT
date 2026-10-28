import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getTerms, getTermsDetail } from '@/features/terms/api/getTerms'
import { TermsPage } from '@/pages/terms/TermsPage'

const { mockNavigate, mockParams } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockParams: { policyId: '42' },
}))
vi.mock('@/features/terms/api/getTerms', () => ({
  getTerms: vi.fn(),
  getTermsDetail: vi.fn(),
}))
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  )),
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
}))
const summary = {
  termsId: 42,
  type: 'SERVICE_TERMS' as const,
  title: '서버 최신 약관',
  version: 'v2',
  effectiveDate: '2026-10-17',
}
const detail = {
  ...summary,
  status: 'PUBLISHED',
  publishedAt: '2026-10-17T00:00:00',
  clauses: [
    { heading: '제1조', content: '첫 문단\n<script>안전한 텍스트</script>' },
  ],
}
const mount = (page: React.ReactNode) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return render(
    <QueryClientProvider client={client}>{page}</QueryClientProvider>,
  )
}
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
beforeEach(() => {
  mockParams.policyId = '42'
  vi.mocked(getTerms).mockResolvedValue([summary])
  vi.mocked(getTermsDetail).mockResolvedValue(detail)
})

describe('TermsPage API integration', () => {
  it('shows server title and date and opens server id', async () => {
    mount(<TermsPage />)
    fireEvent.click(
      await screen.findByRole('button', {
        name: '[서버 최신 약관] 2026.10.17',
      }),
    )
    expect(mockNavigate).toHaveBeenCalledWith('/terms/42')
    expect(screen.queryByText('[Hashi 이용약관]')).not.toBeInTheDocument()
  })
  it('shows an empty result without static fallback', async () => {
    vi.mocked(getTerms).mockResolvedValue([])
    mount(<TermsPage />)
    expect(await screen.findByText('등록된 약관이 없어요.')).toBeInTheDocument()
  })
  it('retries failed list requests', async () => {
    vi.mocked(getTerms).mockRejectedValueOnce(new Error('network'))
    mount(<TermsPage />)
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '약관을 불러오지 못했어요.',
    )
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(await screen.findByText('[서버 최신 약관]')).toBeInTheDocument()
  })
  it('keeps header navigation available while loading', () => {
    vi.mocked(getTerms).mockReturnValue(new Promise(() => {}))
    mount(<TermsPage />)
    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))
    expect(mockNavigate).toHaveBeenCalledWith('/mypage', { replace: true })
  })
})
