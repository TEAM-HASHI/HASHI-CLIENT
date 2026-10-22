import { SoloIcon } from '@hashi/hds-icons'
import { describe, expect, it } from 'vitest'

import {
  getReviewKeywordIcon,
  getReviewKeywordIconByCode,
  getReviewKeywordByValue,
} from '@/features/review/constants/reviewKeywords'

const REVIEW_KEYWORD_CODES = [
  'FOOD_IS_DELICIOUS',
  'MILD_SEASONING',
  'STAFF_IS_KIND',
  'GOOD_FOR_SOLO_DINING',
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

  it('falls back to the canonical API label when a code is unavailable', () => {
    expect(getReviewKeywordIcon({ label: '직원분이 친절해요' })).toBeDefined()
  })

  it.each(['GOOD_FOR_SOLO_DINING', '혼밥하기 좋아요', 'soloDining'])(
    'restores the selected solo dining keyword from %s',
    (value) => {
      expect(getReviewKeywordByValue(value)).toMatchObject({
        id: 'soloDining',
        code: 'GOOD_FOR_SOLO_DINING',
        label: '혼밥하기 좋아요',
        Icon: SoloIcon,
      })
    },
  )

  it('uses the solo icon when only the current label is recognized', () => {
    expect(
      getReviewKeywordIcon({
        code: 'UNKNOWN_KEYWORD',
        label: '혼밥하기 좋아요',
      }),
    ).toBe(SoloIcon)
  })
})
