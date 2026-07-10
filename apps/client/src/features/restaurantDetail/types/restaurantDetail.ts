export type RestaurantDetailTab = 'info' | 'menu' | 'review'

export type RestaurantDetailVariant = 'today' | 'detail'

export interface RestaurantMenu {
  id: string
  name: string
  description: string
  priceCurrency: string
  price: string
  isRepresentative?: boolean
  imageUrl?: string
}

export interface RestaurantReview {
  id: string
  reviewerName: string
  rating: number
  date: string
  content: string
  images: string[]
  keywords: string[]
}

export interface RestaurantDetail {
  id: string
  name: string
  localName: string
  rating: number
  reviewCount: number
  likeCount: string
  summary: string
  address: string
  visitDateLabel: string
  openTime: string
  closeTime: string
  deposit: string
  detailDescription: string
  lastOrderTime: string
  businessHours: {
    day: string
    hours: string
  }[]
  priceRange: string
  heroImages: string[]
  menus: RestaurantMenu[]
  reviews: RestaurantReview[]
}
