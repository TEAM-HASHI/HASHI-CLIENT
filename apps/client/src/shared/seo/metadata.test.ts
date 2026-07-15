import { describe, expect, it } from 'vitest'

import {
  createCanonicalUrl,
  createNoIndexMeta,
  createPageMeta,
} from '@/shared/seo/metadata'

describe('SEO metadata', () => {
  it('creates a canonical URL from the production origin', () => {
    expect(createCanonicalUrl('/restaurants/12')).toBe(
      'https://www.hashi.kr/restaurants/12',
    )
  })

  it('creates title, description, canonical, and Open Graph descriptors', () => {
    expect(
      createPageMeta({
        description: '긴자에 있는 스시 식당입니다.',
        imageUrl: 'https://cdn.hashi.kr/restaurant.jpg',
        path: '/restaurants/12',
        title: '하시 스시 - 메뉴와 예약 정보 | HASHI',
        type: 'restaurant',
      }),
    ).toEqual(
      expect.arrayContaining([
        { title: '하시 스시 - 메뉴와 예약 정보 | HASHI' },
        { name: 'description', content: '긴자에 있는 스시 식당입니다.' },
        {
          tagName: 'link',
          rel: 'canonical',
          href: 'https://www.hashi.kr/restaurants/12',
        },
        { property: 'og:type', content: 'restaurant' },
        {
          property: 'og:image',
          content: 'https://cdn.hashi.kr/restaurant.jpg',
        },
      ]),
    )
  })

  it('omits og:image when a page has no suitable image', () => {
    const descriptors = createPageMeta({
      description: '일본 맛집 큐레이션',
      path: '/',
      title: 'HASHI - 발견부터 예약까지',
    })

    expect(descriptors).not.toContainEqual(
      expect.objectContaining({ property: 'og:image' }),
    )
  })

  it('marks non-indexable pages for noindex and nofollow', () => {
    expect(createNoIndexMeta()).toEqual([
      { name: 'robots', content: 'noindex, nofollow' },
      { name: 'googlebot', content: 'noindex, nofollow' },
    ])
  })
})
