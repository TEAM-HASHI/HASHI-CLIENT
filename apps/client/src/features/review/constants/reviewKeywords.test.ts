import { describe, expect, it } from 'vitest'

import { getReviewKeywordIconByCode } from '@/features/review/constants/reviewKeywords'

const REVIEW_KEYWORD_CODES = [
  'FOOD_IS_DELICIOUS',
  'MILD_SEASONING',
  'STAFF_IS_KIND',
  'TRADITIONAL_ATMOSPHERE',
  'SPACIOUS_INTERIOR',
  'CLEAN_INTERIOR',
  'FAST_SERVICE',
  'PHOTO_FRIENDLY',
  'GOOD_VALUE',
  'GOOD_FOR_CONVERSATION',
] as const

describe('getReviewKeywordIconByCode', () => {
  it.each(REVIEW_KEYWORD_CODES)('maps the %s API code to an icon', (code) => {
    expect(getReviewKeywordIconByCode(code)).toBeDefined()
  })

  it('returns undefined for an unknown API code', () => {
    expect(getReviewKeywordIconByCode('UNKNOWN_KEYWORD')).toBeUndefined()
  })
})
