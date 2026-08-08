import type { components } from '../src/shared/api/generated/openapi'
import type { SeoMagazine, SeoRestaurant } from '../src/shared/seo/types'

export type RestaurantListResponse =
  components['schemas']['RestaurantListResponse']
export type RestaurantListItem =
  components['schemas']['RestaurantSummaryResponse']
export type RestaurantSummaryResponse =
  components['schemas']['RestaurantMainResponse']
export type RestaurantStoreInformationResponse =
  components['schemas']['RestaurantStoreInformationResponse']
export type RestaurantMenuListResponse =
  components['schemas']['RestaurantMenuListResponse']
export type MagazineListResponse = components['schemas']['MagazineListResponse']
export type MagazineBannerListResponse =
  components['schemas']['MagazineBannerListResponse']

export interface RestaurantListParams {
  cursor?: string
  genre?: string
  size?: number
  sort?: string
  type?: string
}

export interface RestaurantMenuListParams {
  cursor?: number
  size?: number
}

export interface MagazineListParams {
  cursor?: number
  size?: number
}

export interface SeoApi {
  getMagazineBanners(): Promise<MagazineBannerListResponse>
  getMagazines(params: MagazineListParams): Promise<MagazineListResponse>
  getRestaurantMenus(
    restaurantId: number,
    params: RestaurantMenuListParams,
  ): Promise<RestaurantMenuListResponse>
  getRestaurants(params: RestaurantListParams): Promise<RestaurantListResponse>
  getRestaurantStoreInformation(
    restaurantId: number,
  ): Promise<RestaurantStoreInformationResponse>
  getRestaurantSummary(restaurantId: number): Promise<RestaurantSummaryResponse>
}

export interface SeoRestaurantEntry {
  restaurant: SeoRestaurant
}

export interface SeoInventory {
  banners: SeoMagazine[]
  hashiPick: SeoRestaurant[]
  homeRestaurants: SeoRestaurant[]
  magazines: SeoMagazine[]
  popular: SeoRestaurant[]
  restaurants: SeoRestaurantEntry[]
}
