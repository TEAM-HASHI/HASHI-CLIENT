import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { HomeCurationSection } from '@/pages/home/components/HomeCurationSection'

const banners = [
  { id: '1', imageUrl: '/first.jpg', imageAlt: '첫 배너', instagramUrl: null },
  {
    id: '2',
    imageUrl: '/second.jpg',
    imageAlt: '둘째 배너',
    instagramUrl: 'https://www.instagram.com/example/',
  },
]

describe('HomeCurationSection', () => {
  it('keeps one indicator outside the moving slides and hides it for one banner', () => {
    const props = { isLoading: false, isError: false, onRetry: vi.fn() }
    const { rerender } = render(
      <HomeCurationSection {...props} banners={banners} />,
    )
    const carousel = screen.getByRole('region', { name: '맛집 큐레이션 배너' })
    const indicators = carousel.querySelectorAll(
      '[data-hds-carousel-indicator]',
    )
    expect(indicators).toHaveLength(1)
    expect(indicators[0]?.closest('[data-hds-carousel-track]')).toBeNull()
    expect(indicators[0]?.children).toHaveLength(2)
    rerender(<HomeCurationSection {...props} banners={banners.slice(0, 1)} />)
    expect(carousel.querySelector('[data-hds-carousel-indicator]')).toBeNull()
  })
})
