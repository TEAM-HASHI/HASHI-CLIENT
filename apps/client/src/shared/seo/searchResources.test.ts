import { describe, expect, it } from 'vitest'

import {
  createRobotsText,
  createSitemapXml,
} from '@/shared/seo/searchResources'

describe('search engine resources', () => {
  it('allows crawling and points to the production sitemap', () => {
    expect(createRobotsText()).toBe(
      [
        'User-agent: *',
        'Allow: /',
        'Sitemap: https://www.hashi.kr/sitemap.xml',
        '',
      ].join('\n'),
    )
  })

  it('contains only supplied canonical paths without a fake lastmod', () => {
    const sitemap = createSitemapXml([
      '/',
      '/restaurants/hashi-pick',
      '/restaurants/12',
    ])

    expect(sitemap).toContain('<loc>https://www.hashi.kr/</loc>')
    expect(sitemap).toContain('<loc>https://www.hashi.kr/restaurants/12</loc>')
    expect(sitemap).not.toContain('/search')
    expect(sitemap).not.toContain('<lastmod>')
  })

  it('escapes XML special characters', () => {
    expect(createSitemapXml(['/restaurants/a&b'])).toContain(
      '<loc>https://www.hashi.kr/restaurants/a&amp;b</loc>',
    )
  })
})
