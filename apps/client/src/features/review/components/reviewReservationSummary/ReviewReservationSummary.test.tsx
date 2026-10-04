import '@testing-library/jest-dom/vitest'

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { ReviewReservationSummary } from '@/features/review/components'

afterEach(() => {
  cleanup()
})

describe('ReviewReservationSummary', () => {
  it('keeps the default density for existing detail callers', () => {
    render(
      <ReviewReservationSummary
        guestSummary="어른 2명"
        restaurantName="하시 식당"
        visitedAt="2026. 6. 28 19:00 방문"
      />,
    )

    const summary = screen.getByRole('region', {
      name: '리뷰 대상 예약 정보',
    })

    expect(summary.firstElementChild).toHaveClass('h-30')
    expect(summary.firstElementChild).not.toHaveClass('py-5')
  })

  it('uses comfortable vertical spacing in review forms', () => {
    render(
      <ReviewReservationSummary
        density="comfortable"
        guestSummary="어른 2명"
        restaurantName="하시 식당"
        visitedAt="2026. 6. 28 19:00 방문"
      />,
    )

    const summary = screen.getByRole('region', {
      name: '리뷰 대상 예약 정보',
    })

    expect(summary.firstElementChild).toHaveClass('py-5')
    expect(summary.firstElementChild).not.toHaveClass('h-30')
  })
})
