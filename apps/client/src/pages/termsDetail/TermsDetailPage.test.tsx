import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getTerms, getTermsDetail } from '@/features/terms/api/getTerms'
import { HttpStatusError } from '@/shared/api/apiError'

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
import { TermsDetailPage } from '@/pages/termsDetail/TermsDetailPage'

describe('TermsDetailPage API integration', () => {
  it('renders server clauses as plain text with line breaks', async () => {
    mount(<TermsDetailPage />)
    expect(await screen.findByText('서버 최신 약관')).toBeInTheDocument()
    expect(getTermsDetail).toHaveBeenCalledWith(42)
    expect(screen.getByText('최종 업데이트: 2026. 10. 17')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '제1조' }))
    expect(screen.getByText(/안전한 텍스트/)).toBeVisible()
    expect(document.querySelector('script')).toBeNull()
  })
  it.each(['unknown', '0', '-1', '1.2', '9007199254740992', '1e2'])(
    'does not request invalid id %s',
    (id) => {
      mockParams.policyId = id
      mount(<TermsDetailPage />)
      expect(
        screen.getByRole('heading', { name: '404 페이지' }),
      ).toBeInTheDocument()
      expect(getTermsDetail).not.toHaveBeenCalled()
    },
  )
  it('handles unpublished or absent terms as 404', async () => {
    vi.mocked(getTermsDetail).mockRejectedValue(new HttpStatusError(404))
    mount(<TermsDetailPage />)
    expect(
      await screen.findByRole('heading', { name: '404 페이지' }),
    ).toBeInTheDocument()
  })
  it('retries a failed detail request', async () => {
    vi.mocked(getTermsDetail).mockRejectedValueOnce(new Error('network'))
    mount(<TermsDetailPage />)
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(await screen.findByText('서버 최신 약관')).toBeInTheDocument()
  })
  it('shows an empty clauses state', async () => {
    vi.mocked(getTermsDetail).mockResolvedValue({ ...detail, clauses: [] })
    mount(<TermsDetailPage />)
    expect(await screen.findByText('등록된 조항이 없어요.')).toBeInTheDocument()
  })
  it('returns to the list', () => {
    mount(<TermsDetailPage />)
    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))
    expect(mockNavigate).toHaveBeenCalledWith('/terms', { replace: true })
  })
})
