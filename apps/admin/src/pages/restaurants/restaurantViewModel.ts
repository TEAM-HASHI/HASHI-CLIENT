import type {
  RestaurantCatalogItem,
  RestaurantMenuData,
  RestaurantStoreInformationData,
  RestaurantSummaryData,
} from '@/pages/restaurants/api/restaurantCatalogApi'
import {
  normalizeRestaurantFoodCategory,
  normalizeRestaurantGenre,
} from '@/pages/restaurants/restaurantOptions'
import type { UploadedImage } from '@/shared/api/uploadApi'

export interface RestaurantPrefillImage {
  sourceUrl: string
  uploaded: UploadedImage | null
}

export interface RestaurantPrefillMenu {
  name: string
  description: string
  image: RestaurantPrefillImage | null
  priceCurrency: string
  priceAmount: number | null
  main: boolean
}

export interface RestaurantPrefillView {
  restaurantId: number
  name: string
  localName: string
  summary: string
  description: string
  address: string
  area: string
  genre: string
  foodCategory: string
  priceCurrency: string
  minPrice: number | null
  maxPrice: number | null
  images: RestaurantPrefillImage[]
  menus: RestaurantPrefillMenu[]
  hashtags: string[]
  curationTypes: string[]
  businessHours: NonNullable<RestaurantStoreInformationData['businessHours']>
}

interface RestaurantPrefillSource {
  listItem: RestaurantCatalogItem | null
  summary: RestaurantSummaryData
  storeInformation: RestaurantStoreInformationData
  menus: RestaurantMenuData[]
}

export const toRestaurantPrefillView = ({
  listItem,
  summary,
  storeInformation,
  menus,
}: RestaurantPrefillSource): RestaurantPrefillView => ({
  restaurantId: summary.restaurantId ?? listItem?.restaurantId ?? 0,
  name: summary.name ?? listItem?.name ?? '',
  localName: summary.localName ?? '',
  summary: summary.summary ?? listItem?.summary ?? '',
  description: storeInformation.description ?? '',
  address: summary.address ?? '',
  area: listItem?.area ?? '',
  genre: normalizeRestaurantGenre(listItem?.genre),
  foodCategory:
    normalizeRestaurantFoodCategory(summary.foodCategory) ||
    normalizeRestaurantFoodCategory(listItem?.foodCategory),
  priceCurrency: storeInformation.priceRange?.currency ?? '',
  minPrice: storeInformation.priceRange?.minPrice ?? null,
  maxPrice: storeInformation.priceRange?.maxPrice ?? null,
  images: (summary.imageUrls ?? listItem?.imageUrls ?? []).map((sourceUrl) => ({
    sourceUrl,
    uploaded: null,
  })),
  menus: menus.map((menu) => ({
    name: menu.name ?? '',
    description: menu.description ?? '',
    image: menu.imageUrl ? { sourceUrl: menu.imageUrl, uploaded: null } : null,
    priceCurrency: menu.currency ?? '',
    priceAmount: menu.price ?? null,
    main: menu.main ?? false,
  })),
  hashtags: listItem?.hashtags ?? [],
  curationTypes: [],
  businessHours: storeInformation.businessHours ?? [],
})
