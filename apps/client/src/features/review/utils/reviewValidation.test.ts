import { describe, expect, it } from 'vitest'

import { checkIsValidReviewPhotoFile } from '@/features/review/utils/reviewValidation'

describe('review photo validation', () => {
  it.each(['image/jpeg', 'image/png', 'image/webp'])(
    'accepts %s files',
    (mimeType) => {
      const photoFile = new File(['image'], 'review-image', { type: mimeType })

      expect(checkIsValidReviewPhotoFile(photoFile)).toBe(true)
    },
  )

  it('rejects unsupported MIME types', () => {
    const photoFile = new File(['image'], 'review.gif', { type: 'image/gif' })

    expect(checkIsValidReviewPhotoFile(photoFile)).toBe(false)
  })
})
