// @vitest-environment node

import { describe, expect, it } from 'vitest'

import type { SeoPage } from '../src/shared/seo/types'
import { renderSitemap } from './renderSitemap'

const page = (canonical: string, robots = 'index, follow'): SeoPage => ({
  canonical,
  description: '설명',
  image: 'https://www.hashi.kr/image.png',
  robots: robots as SeoPage['robots'],
  snapshot: { heading: '제목', links: [], summary: '설명' },
  structuredData: [],
  title: '제목',
  type: 'website',
})

describe('renderSitemap', () => {
  it('renders unique absolute indexable canonical URLs only', () => {
    const xml = renderSitemap([
      page('https://www.hashi.kr/'),
      page('https://www.hashi.kr/restaurants/123'),
      page('https://www.hashi.kr/restaurants/123'),
      page('https://www.hashi.kr/magazines/31', 'noindex, follow'),
    ])

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(xml.match(/<loc>/g)).toHaveLength(2)
    expect(xml).toContain('<loc>https://www.hashi.kr/</loc>')
    expect(xml).toContain('<loc>https://www.hashi.kr/restaurants/123</loc>')
    expect(xml).not.toContain('/magazines/31')
    expect(xml).not.toContain('<lastmod>')
    expect(xml).not.toContain('<changefreq>')
    expect(xml).not.toContain('<priority>')
  })

  it('rejects non-HASHI origins and conflicting duplicate pages', () => {
    expect(() => renderSitemap([page('https://example.com/')])).toThrow(
      'origin',
    )
    expect(() =>
      renderSitemap([
        page('https://www.hashi.kr/restaurants/1'),
        { ...page('https://www.hashi.kr/restaurants/1'), title: '다른 제목' },
      ]),
    ).toThrow('중복 canonical')
  })
})
