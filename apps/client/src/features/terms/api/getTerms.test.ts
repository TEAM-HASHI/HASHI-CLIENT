import { describe, expect, it, vi, afterEach } from 'vitest'
import { getTerms, getTermsDetail } from '@/features/terms/api/getTerms'
import { request } from '@/shared/api/request'
vi.mock('@/shared/api/request', () => ({ request: vi.fn() }))
afterEach(() => vi.resetAllMocks())
describe('terms endpoints', () => {
  it('requests the published list and preserves server order', async () => {
    const rows = [{ termsId: 8 }, { termsId: 2 }]
    vi.mocked(request).mockResolvedValue(rows)
    expect(await getTerms()).toBe(rows)
    expect(request).toHaveBeenCalledWith('/api/v1/terms')
  })
  it('requests detail by server id', async () => {
    const detail = { termsId: 42 }
    vi.mocked(request).mockResolvedValue(detail)
    expect(await getTermsDetail(42)).toBe(detail)
    expect(request).toHaveBeenCalledWith('/api/v1/terms/42')
  })
  it('rejects missing envelopes instead of showing stale static text', async () => {
    vi.mocked(request).mockResolvedValue(null)
    await expect(getTerms()).rejects.toThrow('empty')
    await expect(getTermsDetail(42)).rejects.toThrow('empty')
  })
})
