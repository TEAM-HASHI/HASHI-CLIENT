import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const routeParams = vi.hoisted(() => ({ magazineId: '1' }))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useParams: () => ({ magazineId: routeParams.magazineId }),
  }
})

import { MagazineDetailPage } from '@/pages/magazineDetail/MagazineDetailPage'
import { MagazineImage } from '@/pages/magazineDetail/components/MagazineImage'
import { MagazineRestaurantCard } from '@/pages/magazineDetail/components/MagazineRestaurantCard'

describe('MagazineDetailPage', () => {
  afterEach(cleanup)
  beforeEach(() => {
    routeParams.magazineId = '1'
  })

  it('falls back safely when location preview fields have invalid types', () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/magazines/1',
            state: {
              magazinePreview: {
                imageUrl: 123,
                title: 456,
              },
            },
          },
        ]}
      >
        <MagazineDetailPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('banner')).toHaveTextContent('매거진 상세')
  })

  it('resets local like state when the magazine id changes', () => {
    const { rerender } = render(
      <MemoryRouter>
        <MagazineDetailPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /매거진 좋아요/ }))
    expect(screen.getByRole('button', { name: /좋아요 취소/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    routeParams.magazineId = '2'
    rerender(
      <MemoryRouter>
        <MagazineDetailPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('button', { name: /매거진 좋아요/ }),
    ).toHaveAttribute('aria-pressed', 'false')
  })
})

describe('MagazineRestaurantCard', () => {
  afterEach(cleanup)

  it('does not fabricate an image slot when the restaurant has no images', () => {
    const { container } = render(
      <MemoryRouter>
        <MagazineRestaurantCard
          restaurant={{
            category: '초밥',
            id: '1',
            imageUrls: [],
            name: '식당명',
            openingHours: '평일 · 12:00~19:00',
            priceRange: 'JPY 1,000~2,000',
            rating: 4.5,
            region: '도쿄',
          }}
        />
      </MemoryRouter>,
    )

    expect(container.querySelector('img')).not.toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="image-fallback"]'),
    ).not.toBeInTheDocument()
  })
})

describe('MagazineImage', () => {
  afterEach(cleanup)

  it('retries a previously failed source after the source changes away and back', () => {
    const { container, rerender } = render(
      <MagazineImage alt="매거진 이미지" src="https://example.com/a.jpg" />,
    )

    fireEvent.error(container.querySelector('img')!)
    expect(container.querySelector('img')).not.toBeInTheDocument()

    rerender(
      <MagazineImage alt="매거진 이미지" src="https://example.com/b.jpg" />,
    )
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'https://example.com/b.jpg',
    )

    rerender(
      <MagazineImage alt="매거진 이미지" src="https://example.com/a.jpg" />,
    )
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'https://example.com/a.jpg',
    )
  })
})
