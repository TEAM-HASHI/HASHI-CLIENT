export type SeoRobots =
  | 'index, follow'
  | 'noindex, follow'
  | 'noindex, nofollow'

export interface SeoLink {
  href: string
  image?: string
  imageAlt?: string
  imageHeight?: number
  imageWidth?: number
  label: string
}

export interface SeoFact {
  label: string
  value: string
}

export interface SeoSnapshot {
  facts?: SeoFact[]
  heading: string
  image?: string
  imageAlt?: string
  imageHeight?: number
  imageWidth?: number
  links: SeoLink[]
  summary: string
}

export interface SeoMenu {
  currency?: string
  description: string
  id: string
  image?: string
  name: string
  price?: number
}

export interface SeoRestaurant {
  address: string
  businessHours?: SeoFact[]
  cuisine: string
  description: string
  id: string
  images: string[]
  menus: SeoMenu[]
  name: string
  priceRange?: string
  rating: number
  reviewCount: number
}

export interface SeoMagazine {
  externalUrl?: string | null
  id: string
  image?: string
  publishedDate?: string
  title: string
}

export interface SeoPage {
  canonical: string
  description: string
  image: string
  robots: SeoRobots
  snapshot: SeoSnapshot
  structuredData: Record<string, unknown>[]
  title: string
  type: 'website'
}
