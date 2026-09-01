import { serializeJsonLd } from '@/shared/seo/serializeSeo'
import type { SeoPage } from '@/shared/seo/types'

const SEO_ATTRIBUTE = 'data-hashi-seo'
const SEO_OWNED_SELECTOR = [
  'meta[name="description"]',
  'meta[name="robots"]',
  'meta[property^="og:"]',
  'meta[name^="twitter:"]',
  'link[rel="canonical"]',
  `script[type="application/ld+json"][${SEO_ATTRIBUTE}]`,
].join(',')

const createOwnedElement = <TElement extends HTMLElement>(
  element: TElement,
) => {
  element.setAttribute(SEO_ATTRIBUTE, '')
  return element
}

const appendMeta = (
  attribute: 'name' | 'property',
  key: string,
  content: string,
) => {
  const meta = createOwnedElement(document.createElement('meta'))
  meta.setAttribute(attribute, key)
  meta.content = content
  document.head.append(meta)
}

export const applySeoPage = (page: SeoPage) => {
  document.head
    .querySelectorAll(SEO_OWNED_SELECTOR)
    .forEach((element) => element.remove())

  document.title = page.title
  appendMeta('name', 'description', page.description)
  appendMeta('name', 'robots', page.robots)
  appendMeta('property', 'og:title', page.title)
  appendMeta('property', 'og:description', page.description)
  appendMeta('property', 'og:type', page.type)
  appendMeta('property', 'og:url', page.canonical)
  appendMeta('property', 'og:image', page.image)
  appendMeta('property', 'og:site_name', 'HASHI')
  appendMeta('property', 'og:locale', 'ko_KR')
  appendMeta('name', 'twitter:card', 'summary_large_image')
  appendMeta('name', 'twitter:title', page.title)
  appendMeta('name', 'twitter:description', page.description)
  appendMeta('name', 'twitter:image', page.image)

  const canonical = createOwnedElement(document.createElement('link'))
  canonical.rel = 'canonical'
  canonical.href = page.canonical
  document.head.append(canonical)

  page.structuredData.forEach((structuredData) => {
    const script = createOwnedElement(document.createElement('script'))
    script.type = 'application/ld+json'
    script.text = serializeJsonLd(structuredData)
    document.head.append(script)
  })
}
