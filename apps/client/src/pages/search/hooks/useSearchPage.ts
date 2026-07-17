import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import {
  foodCategoryOptions,
  sortOptions,
} from '@/pages/search/constants/searchFilters'
import { useRecentSearchKeywords } from '@/pages/search/hooks/useRecentSearchKeywords'
import { useSearchKeywordRecommendationsQuery } from '@/pages/search/queries/useSearchKeywordRecommendationsQuery'
import { useSearchRestaurantsInfiniteQuery } from '@/pages/search/queries/useSearchRestaurantsInfiniteQuery'
import type { FoodCategoryValue, SearchSortValue } from '@/pages/search/types'
import { mapSearchRestaurant } from '@/pages/search/utils/mapSearchRestaurant'
import { useInfiniteScrollTrigger } from '@/shared/hooks'

const DEFAULT_SORT_VALUE = 'default' satisfies SearchSortValue
const DEFAULT_FOOD_CATEGORY_VALUE = 'all' satisfies FoodCategoryValue

const getOptionLabel = <TValue extends string>(
  options: readonly { label: string; value: TValue }[],
  value: TValue,
) => {
  return options.find((option) => option.value === value)?.label ?? ''
}

const checkIsSearchSortValue = (
  value: string | null,
): value is SearchSortValue =>
  sortOptions.some((option) => option.value === value)

const checkIsFoodCategoryValue = (
  value: string | null,
): value is FoodCategoryValue =>
  foodCategoryOptions.some((option) => option.value === value)

export const useSearchPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [urlSearchParams, setUrlSearchParams] = useSearchParams()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const urlKeyword = urlSearchParams.get('keyword')?.trim() ?? ''
  const urlSort = urlSearchParams.get('sort')
  const urlFoodCategory = urlSearchParams.get('category')
  const sortValue = checkIsSearchSortValue(urlSort)
    ? urlSort
    : DEFAULT_SORT_VALUE
  const foodCategoryValue = checkIsFoodCategoryValue(urlFoodCategory)
    ? urlFoodCategory
    : DEFAULT_FOOD_CATEGORY_VALUE
  const [keyword, setKeyword] = useState(urlKeyword)
  const [pendingSortValue, setPendingSortValue] =
    useState<SearchSortValue>(sortValue)
  const [pendingFoodCategoryValue, setPendingFoodCategoryValue] =
    useState<FoodCategoryValue>(foodCategoryValue)
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false)
  const [isFoodCategorySheetOpen, setIsFoodCategorySheetOpen] = useState(false)
  const { recentSearchKeywords, saveRecentSearchKeyword } =
    useRecentSearchKeywords()

  const searchParams = useMemo(() => {
    const normalizedKeyword = urlKeyword.trim()

    if (!normalizedKeyword) {
      return null
    }

    return {
      category: foodCategoryValue,
      keyword: normalizedKeyword,
      sort: sortValue,
    }
  }, [foodCategoryValue, sortValue, urlKeyword])

  const searchRestaurantsQuery = useSearchRestaurantsInfiniteQuery(searchParams)
  const searchKeywordRecommendationsQuery =
    useSearchKeywordRecommendationsQuery({ enabled: searchParams === null })
  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchSearchRestaurants,
  } = searchRestaurantsQuery
  const loadMoreRef = useInfiniteScrollTrigger<HTMLDivElement>({
    enabled: Boolean(hasNextPage),
    isLoading: isFetchingNextPage,
    onIntersect: fetchNextPage,
  })
  const restaurants =
    searchRestaurantsQuery.data?.pages.flatMap((page) =>
      page.restaurants.flatMap((restaurant) => {
        const searchRestaurant = mapSearchRestaurant(restaurant)

        return searchRestaurant ? [searchRestaurant] : []
      }),
    ) ?? []
  const isSearchIdle = searchParams === null
  const sortLabel = getOptionLabel(sortOptions, sortValue)
  const foodCategoryLabel =
    foodCategoryValue === DEFAULT_FOOD_CATEGORY_VALUE
      ? '음식 장르 선택'
      : getOptionLabel(foodCategoryOptions, foodCategoryValue)

  useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  const updateSearchUrlParams = ({
    category = foodCategoryValue,
    keyword: nextKeyword = urlKeyword,
    sort = sortValue,
  }: {
    category?: FoodCategoryValue
    keyword?: string
    sort?: SearchSortValue
  }) => {
    const normalizedKeyword = nextKeyword.trim()

    if (!normalizedKeyword) {
      setUrlSearchParams({}, { replace: true })
      return
    }

    const nextSearchParams = new URLSearchParams({ keyword: normalizedKeyword })

    if (sort !== DEFAULT_SORT_VALUE) {
      nextSearchParams.set('sort', sort)
    }

    if (category !== DEFAULT_FOOD_CATEGORY_VALUE) {
      nextSearchParams.set('category', category)
    }

    setUrlSearchParams(nextSearchParams, { replace: true })
  }

  const submitSearch = (nextKeyword = keyword) => {
    const normalizedKeyword = nextKeyword.trim()

    if (!normalizedKeyword) {
      setKeyword('')
      updateSearchUrlParams({ keyword: '' })
      return
    }

    setKeyword(normalizedKeyword)
    updateSearchUrlParams({ keyword: normalizedKeyword })
    saveRecentSearchKeyword(normalizedKeyword)
  }

  const handleBackClick = () => {
    if (location.key !== 'default') {
      navigate(-1)
      return
    }

    navigate(ROUTES.home)
  }

  const handleSortSheetOpenChange = (open: boolean) => {
    setIsSortSheetOpen(open)

    if (open) {
      setPendingSortValue(sortValue)
    }
  }

  const handleFoodCategorySheetOpenChange = (open: boolean) => {
    setIsFoodCategorySheetOpen(open)

    if (open) {
      setPendingFoodCategoryValue(foodCategoryValue)
    }
  }

  const handleSortApply = () => {
    setIsSortSheetOpen(false)
    updateSearchUrlParams({ sort: pendingSortValue })
  }

  const handleFoodCategoryApply = () => {
    setIsFoodCategorySheetOpen(false)
    updateSearchUrlParams({ category: pendingFoodCategoryValue })
  }

  const handleSortReset = () => {
    setPendingSortValue(DEFAULT_SORT_VALUE)
    updateSearchUrlParams({ sort: DEFAULT_SORT_VALUE })
  }

  const handleFoodCategoryReset = () => {
    setPendingFoodCategoryValue(DEFAULT_FOOD_CATEGORY_VALUE)
    updateSearchUrlParams({ category: DEFAULT_FOOD_CATEGORY_VALUE })
  }

  const handleSortSelect = (value: string) => {
    setPendingSortValue(value as SearchSortValue)
  }

  const handleFoodCategorySelect = (value: string) => {
    setPendingFoodCategoryValue(value as FoodCategoryValue)
  }

  const handleSearchRetry = () => {
    void refetchSearchRestaurants()
  }

  return {
    filterLabels: {
      foodCategory: foodCategoryLabel,
      sort: sortLabel,
    },
    foodCategorySheet: {
      open: isFoodCategorySheetOpen,
      options: foodCategoryOptions,
      selectedValue: pendingFoodCategoryValue,
      title: '음식 장르 선택',
      onApply: handleFoodCategoryApply,
      onOpenChange: handleFoodCategorySheetOpenChange,
      onReset: handleFoodCategoryReset,
      onSelect: handleFoodCategorySelect,
    },
    keyword,
    loadMoreRef,
    recentSearchKeywords,
    recommendedSearchKeywords: searchKeywordRecommendationsQuery.data ?? [],
    restaurants,
    searchInputRef,
    searchKeywordRecommendationsQuery,
    searchRestaurantsQuery,
    sortSheet: {
      open: isSortSheetOpen,
      options: sortOptions,
      selectedValue: pendingSortValue,
      title: '정렬 순서',
      onApply: handleSortApply,
      onOpenChange: handleSortSheetOpenChange,
      onReset: handleSortReset,
      onSelect: handleSortSelect,
    },
    status: {
      isSearchIdle,
    },
    onBackClick: handleBackClick,
    onFoodCategoryFilterClick: () => {
      handleFoodCategorySheetOpenChange(true)
    },
    onKeywordChange: setKeyword,
    onKeywordSelect: submitSearch,
    onSearchRetry: handleSearchRetry,
    onSearchSubmit: () => {
      submitSearch()
    },
    onSortFilterClick: () => {
      handleSortSheetOpenChange(true)
    },
  }
}
