import { describe, expect, it } from 'vitest'

import {
  findTermsPolicy,
  TERMS_POLICIES,
} from '@/features/terms/constants/termsPolicies'

describe('TERMS_POLICIES', () => {
  it('lists the eight policies in the Figma list order', () => {
    expect(TERMS_POLICIES.map((policy) => policy.title)).toEqual([
      'Hashi 이용약관',
      '개인정보처리방침',
      '개인정보 수집 및 이용 동의',
      '개인정보 제3자 제공 동의',
      '예약 및 취소·환불 정책',
      '리뷰 운영정책',
      '포인트 이용약관',
      '서비스 운영정책',
    ])
    expect(new Set(TERMS_POLICIES.map((policy) => policy.id)).size).toBe(8)
  })

  it('gives every clause a numbered title and at least one content block', () => {
    TERMS_POLICIES.forEach((policy) => {
      expect(policy.clauses.length).toBeGreaterThan(0)
      policy.clauses.forEach((clause, index) => {
        expect(clause.title).toMatch(new RegExp(`^제${index + 1}조 `))
        expect(clause.blocks.length).toBeGreaterThan(0)
      })
    })
  })

  it('finds a policy by id and returns undefined for unknown ids', () => {
    expect(findTermsPolicy('refund-policy')?.title).toBe(
      '예약 및 취소·환불 정책',
    )
    expect(findTermsPolicy('unknown')).toBeUndefined()
    expect(findTermsPolicy(undefined)).toBeUndefined()
  })
})
