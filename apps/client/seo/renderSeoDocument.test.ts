// @vitest-environment node

import { describe, expect, it } from 'vitest'

import type { SeoPage } from '../src/shared/seo/types'
import { renderSeoDocument } from './renderSeoDocument'

const template = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="description" content="기본 설명" />
    <meta name="robots" content="noindex, nofollow" />
    <meta name="naver-site-verification" content="verification-token" />
    <title>기본 제목</title>
    <script type="module" src="/assets/app.js"></script>
  </head>
  <body><div id="root"></div></body>
</html>`

const page: SeoPage = {
  canonical: 'https://www.hashi.kr/restaurants/123',
  description: '안전한 설명 </script><script>alert(1)</script>',
  image: 'https://images.hashi.kr/123.jpg',
  robots: 'index, follow',
  snapshot: {
    heading: '히마와리 <스시>',
    links: [
      {
        href: '/restaurants/123/menus/10',
        image: 'https://images.hashi.kr/menu-10.jpg',
        imageAlt: '런치 세트 메뉴 이미지',
        imageHeight: 143,
        imageWidth: 143,
        label: '런치 & 세트',
      },
    ],
    summary: '현지 스시를 소개합니다.',
    facts: [{ label: '주소', value: '도쿄도 주오구' }],
    image: 'https://images.hashi.kr/123.jpg',
    imageAlt: '히마와리 스시 대표 이미지',
    imageHeight: 234,
    imageWidth: 393,
  } as SeoPage['snapshot'] & {
    facts: Array<{ label: string; value: string }>
    imageAlt: string
    imageHeight: number
    imageWidth: number
  },
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      description: '</script><script>alert(1)</script>',
      name: '히마와리 스시',
    },
  ],
  title: '히마와리 스시 | HASHI',
  type: 'website',
}

describe('renderSeoDocument', () => {
  it('renders exactly one owned metadata set and preserves app assets', () => {
    const html = renderSeoDocument(template, page)

    expect(html.match(/<title>/g)).toHaveLength(1)
    expect(html.match(/name="description"/g)).toHaveLength(1)
    expect(html.match(/name="robots"/g)).toHaveLength(1)
    expect(html.match(/rel="canonical"/g)).toHaveLength(1)
    expect(html).toContain('name="naver-site-verification"')
    expect(html).toContain('src="/assets/app.js"')
    expect(html).toContain('content="index, follow"')
  })

  it('escapes HTML contexts and produces parseable, script-safe JSON-LD', () => {
    const html = renderSeoDocument(template, page)
    const jsonLd = html.match(
      /<script type="application\/ld\+json" data-hashi-seo>([\s\S]*?)<\/script>/,
    )?.[1]

    expect(jsonLd).toBeDefined()
    expect(jsonLd).not.toContain('</script>')
    expect(JSON.parse(jsonLd!)).toEqual(page.structuredData[0])
    expect(html).not.toContain('<h1>히마와리 <스시></h1>')
    expect(html).toContain('<h1>히마와리 &lt;스시&gt;</h1>')
  })

  it('renders one visible h1 and crawlable snapshot links', () => {
    const html = renderSeoDocument(template, page)

    expect(html.match(/<h1>/g)).toHaveLength(1)
    expect(html).toContain('data-hashi-seo-snapshot')
    expect(html).toContain('href="/restaurants/123/menus/10"')
    expect(html).toContain('런치 &amp; 세트')
    expect(html).toContain('<dt>주소</dt><dd>도쿄도 주오구</dd>')
    expect(html).toContain('alt="히마와리 스시 대표 이미지"')
    expect(html).toContain('width="393" height="234"')
    expect(html).toContain('loading="lazy" decoding="async"')
  })

  it('rejects templates without the expected root or head marker', () => {
    expect(() => renderSeoDocument('<html></html>', page)).toThrow(
      'root 또는 head',
    )
  })
})
