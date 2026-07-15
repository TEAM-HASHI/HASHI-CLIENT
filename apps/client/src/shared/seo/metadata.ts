import type { MetaDescriptor } from 'react-router'

export const SEO_ORIGIN = 'https://www.hashi.kr'

export const createCanonicalUrl = (path: string) => {
  return new URL(path, SEO_ORIGIN).toString()
}

interface CreatePageMetaParams {
  description: string
  imageUrl?: string
  path: string
  title: string
  type?: 'website' | 'restaurant'
}

export const createPageMeta = ({
  description,
  imageUrl,
  path,
  title,
  type = 'website',
}: CreatePageMetaParams): MetaDescriptor[] => {
  const canonicalUrl = createCanonicalUrl(path)

  return [
    { title },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: canonicalUrl },
    { property: 'og:type', content: type },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: canonicalUrl },
    ...(imageUrl ? [{ property: 'og:image', content: imageUrl }] : []),
  ]
}

export const createNoIndexMeta = (): MetaDescriptor[] => [
  { name: 'robots', content: 'noindex, nofollow' },
  { name: 'googlebot', content: 'noindex, nofollow' },
]
