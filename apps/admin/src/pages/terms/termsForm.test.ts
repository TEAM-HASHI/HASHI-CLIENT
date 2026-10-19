import { describe, expect, it } from 'vitest'
import {
  createTermsDraft,
  toTermsRequest,
  validateTerms,
} from '@/pages/terms/termsForm'

describe('terms server input limits', () => {
  const valid = () => ({
    ...toTermsRequest(createTermsDraft('SERVICE_TERMS')),
    title: '약관',
    version: 'v1',
    effectiveDate: '2099-01-01',
    clauses: [{ heading: '조항', content: '내용' }],
  })

  it('rejects invalid calendar dates while allowing future dates for immediate publication', () => {
    expect(validateTerms(valid())).toBeUndefined()
    expect(validateTerms({ ...valid(), effectiveDate: '2026-02-29' })).toMatch(
      /시행일/,
    )
    expect(validateTerms({ ...valid(), effectiveDate: '0999-12-31' })).toMatch(
      /시행일/,
    )
  })

  it('counts clause headings and surrogate pairs in the same UTF-16 units as the server', () => {
    const body = {
      ...valid(),
      clauses: [{ heading: '제목', content: '\uD83D\uDE00'.repeat(49_999) }],
    }
    expect(validateTerms(body)).toBeUndefined()
    body.clauses[0].content += 'a'
    expect(validateTerms(body)).toMatch(/100,000/)
  })
})
