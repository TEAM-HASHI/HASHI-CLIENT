export { RestaurantDetailTemplate } from './components/RestaurantDetailTemplate'
export { getRestaurantMain } from './api/getRestaurantMain'
export type { RestaurantMain } from './api/getRestaurantMain'
export { getRestaurantStoreInformation } from './api/getRestaurantStoreInformation'
export type { RestaurantStoreInformation } from './api/getRestaurantStoreInformation'
export { MOCK_RESTAURANT_DETAIL } from './mocks/restaurantDetail.mock'
export { restaurantDetailQueryKeys } from './queries/restaurantDetailQueryKeys'
export {
  restaurantMainQueryOptions,
  restaurantStoreInformationQueryOptions,
} from './queries/restaurantDetailQueryOptions'
export type {
  RestaurantDetail,
  RestaurantDetailTab,
  RestaurantDetailVariant,
} from './types/restaurantDetail'
