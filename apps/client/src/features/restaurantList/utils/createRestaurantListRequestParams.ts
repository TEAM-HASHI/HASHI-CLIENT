import type { GetRestaurantsParams } from '@/features/restaurantList/api/getRestaurants'
import { RESTAURANT_LIST_PAGE_SIZE } from '@/features/restaurantList/constants'
import type {
  FilterOption,
  RestaurantListCurationType,
} from '@/features/restaurantList/types'

const apiGenreByCategory: Record<
  string,
  NonNullable<GetRestaurantsParams['genre']>
> = {
  all: 'all',
  etc: 'etc',
  fried: 'fried',
  grill: 'grill',
  nabe: 'nabe',
  noodle: 'noodle',
  riceBowl: 'rice-bowl',
  sushi: 'sushi',
}

const apiSortByValue: Record<
  string,
  NonNullable<GetRestaurantsParams['sort']>
> = {
  default: 'basic',
  popular: 'popular',
  rating: 'rating',
}

interface CreateRestaurantListRequestParamsParams {
  category: FilterOption
  sort: FilterOption
  type: RestaurantListCurationType
}

export const createRestaurantListRequestParams = ({
  category,
  sort,
  type,
}: CreateRestaurantListRequestParamsParams): GetRestaurantsParams => {
  return {
    genre: apiGenreByCategory[category.value] ?? 'all',
    size: RESTAURANT_LIST_PAGE_SIZE,
    sort: apiSortByValue[sort.value] ?? 'basic',
    type,
  }
}
