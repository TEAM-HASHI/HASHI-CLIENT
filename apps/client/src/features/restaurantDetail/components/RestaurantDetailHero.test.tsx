import { Carousel } from '@hashi/hds-ui'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { RestaurantDetailHero } from '@/features/restaurantDetail/components/RestaurantDetailHero'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('RestaurantDetailHero', () => {
  it('keeps images 7 through 10 on the sixth dot in both directions', () => {
    const root = vi.spyOn(Carousel, 'Root')
    render(
      <RestaurantDetailHero
        imageUrls={Array.from({ length: 10 }, (_, i) => `/photo-${i}.jpg`)}
      />,
    )
    for (const index of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 8, 5, 4, 0]) {
      act(() => root.mock.calls.at(-1)?.[0].onIndexChange?.(index))
      const dots = Array.from(
        screen.getByLabelText('대표 이미지 위치').children,
      )
      expect(dots.findIndex((dot) => dot.hasAttribute('data-current'))).toBe(
        Math.min(index, 5),
      )
    }
  })
  it.each([0, 1, 5, 6, 7, 10, 11])(
    'limits images and dots for %i images',
    (count) => {
      const { container } = render(
        <RestaurantDetailHero
          imageUrls={Array.from({ length: count }, (_, i) => `/photo-${i}.jpg`)}
        />,
      )
      expect(
        container.querySelectorAll('[aria-roledescription="slide"]'),
      ).toHaveLength(Math.max(1, Math.min(count, 10)))
      if (count === 0) {
        expect(
          container.querySelector('[data-slot="image-fallback"]'),
        ).toBeInTheDocument()
        expect(
          screen.queryByLabelText('대표 이미지 위치'),
        ).not.toBeInTheDocument()
      } else {
        expect(screen.getByLabelText('대표 이미지 위치').children).toHaveLength(
          Math.min(count, 6),
        )
        expect(
          container.querySelector('img[src="/photo-10.jpg"]'),
        ).not.toBeInTheDocument()
      }
    },
  )
})
