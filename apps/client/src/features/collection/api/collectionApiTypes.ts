import type { components, operations } from '@/shared/api/generated/openapi'

export type CollectionsParamsTypes = NonNullable<
  operations['getMyCollections']['parameters']['query']
>
export type CollectionsListFiltersTypes = Omit<CollectionsParamsTypes, 'cursor'>
export type SavedRestaurantsParamsTypes = NonNullable<
  operations['getSavedRestaurants']['parameters']['query']
>
export type SavedRestaurantsFiltersTypes = Omit<
  SavedRestaurantsParamsTypes,
  'cursor'
>

export type CollectionListData =
  components['schemas']['RestaurantCollectionListResponse']
export type CollectionSummaryData =
  components['schemas']['RestaurantCollectionSummaryResponse']
export type CollectionDetailData =
  components['schemas']['RestaurantCollectionResponse']
export type SavedRestaurantListData =
  components['schemas']['SavedRestaurantListResponse']
export type SavedRestaurantData =
  components['schemas']['SavedRestaurantResponse']
