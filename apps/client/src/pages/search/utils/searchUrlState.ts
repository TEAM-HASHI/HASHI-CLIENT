import {
  DEFAULT_FOOD_CATEGORY_VALUE,
  DEFAULT_SORT_VALUE,
  foodCategoryOptions,
  sortOptions,
} from '@/pages/search/constants/searchFilters'
import type {
  FoodCategoryValue,
  SearchRestaurantsParams,
  SearchSortValue,
} from '@/pages/search/types'

const checkIsSearchSortValue = (
  value: string | null,
): value is SearchSortValue =>
  sortOptions.some((option) => option.value === value)

const checkIsFoodCategoryValue = (
  value: string | null,
): value is FoodCategoryValue =>
  foodCategoryOptions.some((option) => option.value === value)

export const parseSearchUrlState = (
  searchParams: URLSearchParams,
): SearchRestaurantsParams => {
  const urlSort = searchParams.get('sort')
  const urlFoodCategory = searchParams.get('category')

  return {
    category: checkIsFoodCategoryValue(urlFoodCategory)
      ? urlFoodCategory
      : DEFAULT_FOOD_CATEGORY_VALUE,
    keyword: searchParams.get('keyword')?.trim() ?? '',
    sort: checkIsSearchSortValue(urlSort) ? urlSort : DEFAULT_SORT_VALUE,
  }
}

export const createSearchUrlParams = ({
  category,
  keyword,
  sort,
}: SearchRestaurantsParams) => {
  const normalizedKeyword = keyword.trim()

  if (!normalizedKeyword) {
    return new URLSearchParams()
  }

  const searchParams = new URLSearchParams({ keyword: normalizedKeyword })

  if (sort !== DEFAULT_SORT_VALUE) {
    searchParams.set('sort', sort)
  }

  if (category !== DEFAULT_FOOD_CATEGORY_VALUE) {
    searchParams.set('category', category)
  }

  return searchParams
}
