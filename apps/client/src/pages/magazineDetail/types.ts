export interface MagazineDetailRestaurant {
  id: string
  name: string
  rating: number
  region: string
  category: string
  imageUrls: Array<string | null>
  openingHours: string
  priceRange: string
}

export interface MagazineDetailPreview {
  title: string
  coverImageUrls: string[]
  content: string
  hashtag: string
  publishedAt: string
  likeCount: number
  restaurants: MagazineDetailRestaurant[]
}
