import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'

import { createRestaurantDetailSeoPage } from '@/shared/seo/pageBuilders'
import { PageSeo } from '@/shared/seo/PageSeo'
import { SeoProvider } from '@/shared/seo/SeoProvider'

const restaurantPage = createRestaurantDetailSeoPage({
  address: '도쿄도 시부야구',
  cuisine: 'sushi',
  description: '시부야 오마카세',
  id: '123',
  images: ['https://cdn.hashi.kr/123.webp'],
  menus: [],
  name: '스시 하시',
  rating: 4.8,
  reviewCount: 24,
})

const RestaurantRoute = () => {
  const navigate = useNavigate()

  return (
    <>
      <PageSeo page={restaurantPage} />
      <button onClick={() => navigate('/mypage')} type="button">
        마이페이지로 이동
      </button>
    </>
  )
}

const renderSeoRoutes = (initialEntry = '/restaurants/123') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <SeoProvider>
        <Routes>
          <Route element={<RestaurantRoute />} path="/restaurants/123" />
          <Route element={<p>마이페이지</p>} path="/mypage" />
        </Routes>
      </SeoProvider>
    </MemoryRouter>,
  )

describe('SeoProvider', () => {
  afterEach(() => {
    cleanup()
    document.head
      .querySelectorAll('[data-hashi-seo]')
      .forEach((element) => element.remove())
    document.title = ''
  })

  it('applies one complete metadata set from the registered page', () => {
    renderSeoRoutes()

    expect(document.title).toBe('스시 하시 | 일본 맛집 정보·메뉴·예약 | HASHI')
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://www.hashi.kr/restaurants/123',
    )
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'index, follow',
    )
    expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(
      1,
    )
    expect(
      document.querySelectorAll('script[type="application/ld+json"]'),
    ).toHaveLength(1)
  })

  it('preserves matching prerendered metadata while the initial route is loading', () => {
    document.title = '프리렌더 식당 | HASHI'
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'index, follow'
    robots.setAttribute('data-hashi-seo', '')
    document.head.append(robots)
    const canonical = document.createElement('link')
    canonical.rel = 'canonical'
    canonical.href = 'https://www.hashi.kr/restaurants/123'
    canonical.setAttribute('data-hashi-seo', '')
    document.head.append(canonical)

    render(
      <MemoryRouter initialEntries={['/restaurants/123']}>
        <SeoProvider>
          <p>식당 정보를 불러오는 중</p>
        </SeoProvider>
      </MemoryRouter>,
    )

    expect(document.title).toBe('프리렌더 식당 | HASHI')
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'index, follow',
    )
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://www.hashi.kr/restaurants/123',
    )
  })

  it('drops the previous canonical and schemas on a private route', () => {
    renderSeoRoutes()

    fireEvent.click(screen.getByRole('button', { name: '마이페이지로 이동' }))

    expect(document.title).toBe('HASHI')
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://www.hashi.kr/mypage',
    )
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    )
    expect(
      document.querySelectorAll('script[type="application/ld+json"]'),
    ).toHaveLength(0)
  })
})
