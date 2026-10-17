import { describe, expect, it } from 'vitest'

import { TERMS_POLICIES } from '@/features/terms/constants/termsPolicies'

describe('TERMS_POLICIES', () => {
  it('gives every clause a numbered title and at least one content block', () => {
    TERMS_POLICIES.forEach((policy) => {
      expect(policy.clauses.length).toBeGreaterThan(0)
      policy.clauses.forEach((clause, index) => {
        expect(clause.title).toMatch(new RegExp(`^제${index + 1}조 `))
        expect(clause.blocks.length).toBeGreaterThan(0)
      })
    })
  })
})
