export interface MagazineHeroBanner {
  id: string
  imageUrl: string
  instagramUrl: string | null
  displayOrder: number
  accessibilityLabel: string
}

export interface RecommendedMagazine {
  id: string
  title: string
  imageUrl: string
  publishedDate: string
  instagramUrl: string | null
}
