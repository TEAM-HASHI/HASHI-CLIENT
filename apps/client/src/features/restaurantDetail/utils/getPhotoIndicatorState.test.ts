import { describe, expect, it } from 'vitest'

import { getPhotoIndicatorState } from '@/features/restaurantDetail/utils/getPhotoIndicatorState'

describe('getPhotoIndicatorState', () => {
  it('has no dots for no photos', () => {
    expect(getPhotoIndicatorState(0, 0)).toEqual({ dotCount: 0, currentDot: 0 })
  })

  it.each([1, 2, 3, 4, 5, 6])(
    'uses one dot per photo for %i photos',
    (total) => {
      for (let index = 0; index < total; index++) {
        expect(getPhotoIndicatorState(total, index)).toEqual({
          dotCount: total,
          currentDot: index,
        })
      }
    },
  )

  it.each([
    [7, [0, 0, 1, 2, 3, 4, 5]],
    [8, [0, 0, 1, 2, 3, 3, 4, 5]],
    [9, [0, 0, 1, 2, 2, 3, 4, 4, 5]],
    [10, [0, 0, 1, 1, 2, 3, 3, 4, 4, 5]],
  ] as const)('splits %i photos into six sections', (total, expected) => {
    expected.forEach((currentDot, index) => {
      expect(getPhotoIndicatorState(total, index)).toEqual({
        dotCount: 6,
        currentDot,
      })
    })
  })
})
