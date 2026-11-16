import { SoloIcon } from '@hashi/hds-icons'
import { describe, expect, it } from 'vitest'

import {
  getReviewKeywordIcon,
  getReviewKeywordByValue,
} from '@/features/review/constants/reviewKeywords'

describe('review keyword lookup', () => {
  it('still recognizes the legacy kindness label', () => {
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
