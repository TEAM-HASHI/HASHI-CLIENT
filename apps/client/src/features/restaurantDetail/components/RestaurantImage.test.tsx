import '@testing-library/jest-dom/vitest'

import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { RestaurantImage } from '@/features/restaurantDetail/components/RestaurantImage'

describe('RestaurantImage', () => {
  it('retries a previously failed image after src changes away and back', () => {
    const { container, rerender } = render(
      <RestaurantImage className="size-full" markSize="lg" src="/a.png" />,
    )

    fireEvent.error(container.querySelector('img') as HTMLImageElement)
    expect(
      container.querySelector('[data-slot="image-fallback"]'),
    ).toBeInTheDocument()

    rerender(
      <RestaurantImage className="size-full" markSize="lg" src="/b.png" />,
    )
    expect(container.querySelector('img')).toHaveAttribute('src', '/b.png')

    rerender(
      <RestaurantImage className="size-full" markSize="lg" src="/a.png" />,
    )
    expect(container.querySelector('img')).toHaveAttribute('src', '/a.png')
  })
})
