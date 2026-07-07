export type SearchSortValue = 'default' | 'popular' | 'rating'

export type FoodCategoryValue =
  | 'all'
  | 'sushiSashimi'
  | 'noodle'
  | 'riceBowl'
  | 'nabe'
  | 'fried'
  | 'teppanGrill'
  | 'etc'

export interface SearchFilterOption<TValue extends string> {
  label: string
  value: TValue
}

export interface SearchRestaurant {
  id: string
  name: string
  imageUrl?: string
  rating: number
  category: FoodCategoryValue
  tag: string
  businessHours: string
  popularity: number
  keywords: string[]
}

export interface SearchRestaurantsParams {
  category: FoodCategoryValue
  keyword: string
  sort: SearchSortValue
}
