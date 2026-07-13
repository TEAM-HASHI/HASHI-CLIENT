import '@testing-library/jest-dom/vitest'

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ReservationRestaurantSummary } from '@/pages/reservationDetail/components/ReservationRestaurantSummary'

describe('ReservationRestaurantSummary', () => {
  it('shows the default image when the restaurant image fails to load', () => {
    render(
      <ReservationRestaurantSummary
        requestedDate="2026.7.12"
        requestedLabel="예약 신청"
        restaurant={{
          name: '스시 하시 긴자점',
          localName: '寿司ハシ 銀座店',
          imageSrc: 'https://example.com/broken.jpg',
        }}
      />,
    )

    const restaurantImage = screen.getByRole('img', {
      name: '스시 하시 긴자점',
    })

    fireEvent.error(restaurantImage)

    expect(
      screen.getByRole('img', { name: '스시 하시 긴자점 이미지' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('img', { name: '스시 하시 긴자점' }),
    ).not.toBeInTheDocument()
  })
})
