import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ReviewImagePlaceholder } from '@/pages/myReviews/components/ReviewImagePlaceholder'

describe('ReviewImagePlaceholder', () => {
  it('retries with a new image source after the previous source fails', () => {
    const { rerender } = render(
      <ReviewImagePlaceholder src="https://example.com/failed.jpg" />,
    )

    fireEvent.error(screen.getByRole('presentation'))
    expect(screen.getByTestId('my-review-default-image')).toBeVisible()

    rerender(<ReviewImagePlaceholder src="https://example.com/next.jpg" />)

    expect(screen.getByRole('presentation')).toHaveAttribute(
      'src',
      'https://example.com/next.jpg',
    )
  })
})
