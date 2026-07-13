export type HomeBanner = {
  id: string
  imageUrl: string
  imageAlt: string
  instagramUrl: string | null
}

export type HomeQuickLinkId =
  | 'hashiPick'
  | 'popular'
  | 'magazine'
  | 'todayRestaurant'

export type HomeQuickLink = {
  id: HomeQuickLinkId
  label: string
  to: string
}

export type HotSnsRestaurant = {
  restaurantId: string
  name: string
  summary: string
  imageUrl: string
  imageAlt: string
}
