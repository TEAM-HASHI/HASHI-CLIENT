import { createCanonicalUrl, SEO_ORIGIN } from '@/shared/seo/metadata'

export const createHomeStructuredData = () => [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'HASHI',
    url: createCanonicalUrl('/'),
    inLanguage: 'ko-KR',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'HASHI',
    url: createCanonicalUrl('/'),
    logo: new URL('/favicon.svg', SEO_ORIGIN).toString(),
  },
]

interface CreateRestaurantStructuredDataParams {
  address: string
  description: string
  imageUrls: string[]
  name: string
  restaurantId: number
}

export const createRestaurantStructuredData = ({
  address,
  description,
  imageUrls,
  name,
  restaurantId,
}: CreateRestaurantStructuredDataParams) => ({
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  address: {
    '@type': 'PostalAddress',
    streetAddress: address,
  },
  description,
  ...(imageUrls.length > 0 ? { image: imageUrls } : {}),
  name,
  url: createCanonicalUrl(`/restaurants/${restaurantId}`),
})
