import '@testing-library/jest-dom/vitest'

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ReservationCardImage } from '@/pages/myReservations/components/ReservationCardImage'

describe('ReservationCardImage', () => {
  it('shows ImageFallback when the restaurant image fails to load', () => {
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

  it('retries a previously failed image after the src changes away and back', () => {
    const { rerender } = render(
      <ReservationCardImage
        imageUrl="https://example.com/a.jpg"
        restaurantName="스시 하시"
      />,
    )

    fireEvent.error(screen.getByRole('img', { name: '스시 하시' }))

    rerender(
      <ReservationCardImage
        imageUrl="https://example.com/b.jpg"
        restaurantName="스시 하시"
      />,
    )
    expect(screen.getByRole('img', { name: '스시 하시' })).toHaveAttribute(
      'src',
      'https://example.com/b.jpg',
    )

    rerender(
      <ReservationCardImage
        imageUrl="https://example.com/a.jpg"
        restaurantName="스시 하시"
      />,
    )
    expect(screen.getByRole('img', { name: '스시 하시' })).toHaveAttribute(
      'src',
      'https://example.com/a.jpg',
    )
  })
})
