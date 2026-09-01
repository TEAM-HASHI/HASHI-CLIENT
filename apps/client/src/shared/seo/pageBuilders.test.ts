import { describe, expect, it } from 'vitest'

import {
  createCanonicalUrl,
  createHomeSeoPage,
  createMagazineListSeoPage,
  createMenuDetailSeoPage,
  createRestaurantDetailSeoPage,
  createRestaurantListSeoPage,
} from '@/shared/seo/pageBuilders'
import { serializeJsonLd } from '@/shared/seo/serializeSeo'
import type { SeoRestaurant } from '@/shared/seo/types'

const restaurant: SeoRestaurant = {
  address: '도쿄도 시부야구',
  cuisine: 'sushi',
  description: '현지 제철 생선을 사용하는 오마카세 전문점',
  id: '123',
  images: ['https://cdn.hashi.kr/restaurants/123.webp'],
  menus: [
    {
      currency: 'JPY',
      description: '오늘의 제철 생선 구성',
      id: '10',
      image: 'https://cdn.hashi.kr/menus/10.webp',
      name: '오마카세',
      price: 12000,
    },
  ],
  name: '스시 하시',
  rating: 4.8,
  reviewCount: 24,
}

describe('SEO page builders', () => {
  it('removes query and hash from canonical URLs', () => {
    expect(createCanonicalUrl('/restaurants/123?from=home#menu')).toBe(
      'https://www.hashi.kr/restaurants/123',
    )
  })

  it('creates the home metadata and organization schema', () => {
    const page = createHomeSeoPage({ restaurants: [restaurant] })

    expect(page).toMatchObject({
      canonical: 'https://www.hashi.kr/',
      description:
        '한국인 여행자를 위한 일본 맛집 큐레이션 및 예약 서비스 HASHI입니다.',
      robots: 'index, follow',
      title: 'HASHI | 일본 맛집 발견부터 예약까지',
    })
    expect(page.structuredData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ '@type': 'Organization', name: 'HASHI' }),
        expect.objectContaining({ '@type': 'WebSite', name: 'HASHI' }),
      ]),
    )
  })

  it('includes current magazine banners in the home snapshot', () => {
    const input = {
      magazines: [
        {
          externalUrl: 'https://www.instagram.com/p/hashi-banner',
          id: 'banner-1',
          image: 'https://cdn.hashi.kr/banners/1.webp',
          title: '도쿄 미식 배너',
        },
      ],
      restaurants: [restaurant],
    }

    const page = createHomeSeoPage(input)

    expect(page.snapshot.links).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: 'https://www.instagram.com/p/hashi-banner',
          label: '도쿄 미식 배너',
        }),
        expect.objectContaining({
          href: '/restaurants/123',
          label: '스시 하시',
        }),
      ]),
    )
  })

  it('creates restaurant metadata with only valid rating data', () => {
    const page = createRestaurantDetailSeoPage(restaurant)

    expect(page).toMatchObject({
      canonical: 'https://www.hashi.kr/restaurants/123',
      description: restaurant.description,
      image: restaurant.images[0],
      robots: 'index, follow',
      title: '스시 하시 | 일본 맛집 정보·메뉴·예약 | HASHI',
    })
    expect(page.structuredData).toContainEqual(
      expect.objectContaining({
        '@type': 'Restaurant',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: 4.8,
          reviewCount: 24,
        },
        name: '스시 하시',
      }),
    )
  })

  it('adds visible restaurant facts to the semantic snapshot', () => {
    const restaurantWithFacts = {
      ...restaurant,
      businessHours: [{ label: '월', value: '11:00 - 20:00' }],
      priceRange: 'JPY 1,000 - 3,000',
    }

    const page = createRestaurantDetailSeoPage(restaurantWithFacts)

    expect(page.snapshot.facts).toEqual([
      { label: '주소', value: '도쿄도 시부야구' },
      { label: '평점', value: '4.8/5 · 리뷰 24개' },
      { label: '가격대', value: 'JPY 1,000 - 3,000' },
      { label: '월', value: '11:00 - 20:00' },
    ])
  })

  it('uses restaurant fallbacks and omits invalid aggregate ratings', () => {
    const page = createRestaurantDetailSeoPage({
      ...restaurant,
      description: '',
      images: [],
      rating: 0,
      reviewCount: 0,
    })

    expect(page.description).toBe(
      '스시 하시의 위치, 메뉴, 가격, 영업시간과 예약 정보를 확인하세요.',
    )
    expect(page.image).toBe('https://www.hashi.kr/icons/pwa-512x512.png')
    expect(page.structuredData[0]).not.toHaveProperty('aggregateRating')
    expect(page.structuredData[0]).not.toHaveProperty('image')
  })

  it('creates menu and breadcrumb schemas with the concrete URL', () => {
    const page = createMenuDetailSeoPage({
      menu: restaurant.menus[0],
      otherMenus: [],
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
      },
    })

    expect(page).toMatchObject({
      canonical: 'https://www.hashi.kr/restaurants/123/menus/10',
      robots: 'index, follow',
      title: '오마카세 - 스시 하시 | HASHI',
    })
    expect(page.structuredData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ '@type': 'MenuItem', name: '오마카세' }),
        expect.objectContaining({ '@type': 'BreadcrumbList' }),
      ]),
    )
    expect(page.snapshot.facts).toContainEqual({
      label: '가격',
      value: 'JPY 12,000',
    })
  })

  it('omits the menu offer and price fact when the price is missing', () => {
    const page = createMenuDetailSeoPage({
      menu: { ...restaurant.menus[0], price: undefined },
      otherMenus: [],
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
      },
    })

    expect(page.structuredData[0]).not.toHaveProperty('offers')
    expect(page.snapshot.facts).toEqual([])
  })

  it('creates list schemas from only the visible items', () => {
    const hashiPickPage = createRestaurantListSeoPage({
      restaurants: [restaurant],
      type: 'hashi-pick',
    })
    const magazinePage = createMagazineListSeoPage({
      magazines: [
        {
          externalUrl: 'https://www.instagram.com/p/hashi',
          id: '7',
          image: 'https://cdn.hashi.kr/magazines/7.webp',
          publishedDate: '2026-08-07',
          title: '도쿄 스시 여행',
        },
      ],
    })

    expect(hashiPickPage.title).toBe(
      '하시 PICK | 일본 현지 맛집 큐레이션 | HASHI',
    )
    expect(hashiPickPage.structuredData).toContainEqual(
      expect.objectContaining({
        '@type': 'ItemList',
        numberOfItems: 1,
      }),
    )
    expect(magazinePage.structuredData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ '@type': 'CollectionPage' }),
        expect.objectContaining({
          '@type': 'ItemList',
          numberOfItems: 1,
        }),
      ]),
    )
  })

  it('serializes JSON-LD without leaving executable closing tags', () => {
    const serialized = serializeJsonLd({
      description: '</script><script>alert(1)</script>',
    })

    expect(serialized).not.toContain('</script>')
    expect(JSON.parse(serialized)).toEqual({
      description: '</script><script>alert(1)</script>',
    })
  })
})
