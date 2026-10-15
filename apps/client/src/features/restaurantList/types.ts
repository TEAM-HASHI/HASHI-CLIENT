export type FilterOption = {
  label: string
  value: string
}

export type RestaurantListCurationType = 'hashi-pick' | 'popular' | 'sns-hot'

export type Restaurant = {
  id: string
  name: string
  rating: number
  region: string
  category: string
  images: string[]
  description: string
  hashtags: string[]
}
