import type { SeoPage } from '../src/shared/seo/types'
import { SEO_SITE_ORIGIN } from '../src/shared/seo/pageBuilders'
import { escapeXml } from '../src/shared/seo/serializeSeo'

const SITEMAP_MAX_URLS = 50_000
const SITEMAP_MAX_BYTES = 50 * 1024 * 1024

export const renderSitemap = (pages: SeoPage[]) => {
  const canonicalPages = new Map<string, SeoPage>()

  for (const page of pages) {
    const url = new URL(page.canonical)

    if (url.origin !== SEO_SITE_ORIGIN) {
      throw new Error(
        `sitemap canonical origin이 HASHI가 아닙니다: ${url.origin}`,
      )
    }

    const current = canonicalPages.get(page.canonical)

    if (current && JSON.stringify(current) !== JSON.stringify(page)) {
      throw new Error(
        `sitemap 중복 canonical 내용이 다릅니다: ${page.canonical}`,
      )
    }

    canonicalPages.set(page.canonical, current ?? page)
  }

  const indexablePages = [...canonicalPages.values()].filter(
    (page) => page.robots === 'index, follow',
  )

  if (indexablePages.length >= SITEMAP_MAX_URLS) {
    throw new Error(
      `sitemap URL 수가 분할 기준 ${SITEMAP_MAX_URLS}개에 도달했습니다.`,
    )
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...indexablePages.map(
      (page) => `  <url><loc>${escapeXml(page.canonical)}</loc></url>`,
    ),
    '</urlset>',
    '',
  ].join('\n')

  if (Buffer.byteLength(xml, 'utf8') >= SITEMAP_MAX_BYTES) {
    throw new Error('sitemap 크기가 비압축 50MB 분할 기준에 도달했습니다.')
  }

  return xml
}
