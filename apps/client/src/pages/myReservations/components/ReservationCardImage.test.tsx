import '@testing-library/jest-dom/vitest'

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ReservationCardImage } from '@/pages/myReservations/components/ReservationCardImage'

describe('ReservationCardImage', () => {
  it('shows the default image when the restaurant image fails to load', () => {
    render(
      <ReservationCardImage
        imageUrl="https://example.com/broken.jpg"
        restaurantName="스시 하시"
      />,
    )

    const restaurantImage = screen.getByRole('img', { name: '스시 하시' })

    fireEvent.error(restaurantImage)

    expect(
      screen.getByRole('img', { name: '스시 하시 이미지' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('img', { name: '스시 하시' }),
    ).not.toBeInTheDocument()
  })
})
