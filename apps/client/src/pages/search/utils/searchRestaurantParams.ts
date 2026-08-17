import type { GetRestaurantsParams } from '@/features/restaurantList/api/getRestaurants'
import type { SearchRestaurantsParams } from '@/pages/search/types'

const SEARCH_RESTAURANTS_PAGE_SIZE = 10

const apiGenreByCategory = {
  all: 'all',
  etc: 'etc',
  fried: 'fried',
  nabe: 'nabe',
  noodle: 'noodle',
  riceBowl: 'rice-bowl',
  sushiSashimi: 'sushi',
  teppanGrill: 'grill',
} satisfies Record<SearchRestaurantsParams['category'], string>

export const createSearchRestaurantsRequestParams = ({
  category,
  keyword,
  sort,
}: SearchRestaurantsParams): GetRestaurantsParams => {
  return {
    genre: apiGenreByCategory[category],
    keyword,
    size: SEARCH_RESTAURANTS_PAGE_SIZE,
    ...(sort !== 'default' && { sort }),
  }
}
