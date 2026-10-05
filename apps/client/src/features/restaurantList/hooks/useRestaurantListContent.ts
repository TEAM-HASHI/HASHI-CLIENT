import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { getRestaurantDetailPath } from '@/app/router/routePaths'
import {
  CATEGORY_OPTIONS,
  DEFAULT_CATEGORY_OPTION,
} from '@/features/restaurantList/constants'
import { restaurantsInfiniteQueryOptions } from '@/features/restaurantList/queries/useRestaurantsInfiniteQuery'
import { restaurantListQueryKeys } from '@/features/restaurantList/queries/restaurantListQueryKeys'
import { useRestaurantListRestoration } from '@/features/restaurantList/hooks/useRestaurantListRestoration'
import type {
  FilterOption,
  RestaurantListCurationType,
} from '@/features/restaurantList/types'
import {
  createRestaurantListRequestParams,
  mapRestaurantSummaryToRestaurant,
} from '@/features/restaurantList/utils'
import { useInfiniteScrollTrigger } from '@/shared/hooks'

type ActiveBottomSheet = 'sort' | 'category' | null

type UseRestaurantListContentParams = {
  restaurantType: RestaurantListCurationType
  sortOptions: FilterOption[]
}

const getOptionByValue = (options: FilterOption[], value: string) => {
  return options.find((option) => option.value === value)
}

const getSelectedOption = (
  options: FilterOption[],
  value: string | null,
  fallback: FilterOption,
) => {
  return (value && getOptionByValue(options, value)) || fallback
}

export const useRestaurantListContent = ({
  restaurantType,
  sortOptions,
}: UseRestaurantListContentParams) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const defaultSortOption = sortOptions[0]
  const selectedSort = getSelectedOption(
    sortOptions,
    searchParams.get('sort'),
    defaultSortOption,
  )
  const selectedCategory = getSelectedOption(
    CATEGORY_OPTIONS,
    restaurantType === 'sns-hot' ? null : searchParams.get('genre'),
    DEFAULT_CATEGORY_OPTION,
  )
  const [activeBottomSheet, setActiveBottomSheet] =
    useState<ActiveBottomSheet>(null)
  const [draftSort, setDraftSort] = useState(selectedSort)
  const [draftCategory, setDraftCategory] = useState(selectedCategory)

  const requestParams = useMemo(
    () =>
      createRestaurantListRequestParams({
        category: selectedCategory,
        sort: selectedSort,
        type: restaurantType,
      }),
    [restaurantType, selectedCategory, selectedSort],
  )
  const restaurantsQuery = useInfiniteQuery({
    ...restaurantsInfiniteQueryOptions(requestParams),
    throwOnError: false,
  })
  const visibleRestaurants =
    restaurantsQuery.data?.pages.flatMap((page) =>
      page.restaurants.flatMap((restaurant) => {
        const mappedRestaurant = mapRestaurantSummaryToRestaurant(restaurant)

        return mappedRestaurant ? [mappedRestaurant] : []
      }),
    ) ?? []
  const hasMoreRestaurants = Boolean(restaurantsQuery.hasNextPage)
  const hasInitialLoadError =
    restaurantsQuery.isError && visibleRestaurants.length === 0
  const { hasRestorationError, isRestoring, saveScrollPosition } =
    useRestaurantListRestoration({
      pageCount: restaurantsQuery.data?.pages.length ?? 0,
      hasNextPage: hasMoreRestaurants,
      isPending: restaurantsQuery.isPending,
      isFetching: restaurantsQuery.isFetching,
      isError: restaurantsQuery.isError,
      fetchNextPage: restaurantsQuery.fetchNextPage,
    })
  const hasNextPageError =
    (restaurantsQuery.isFetchNextPageError || hasRestorationError) &&
    visibleRestaurants.length > 0
  const loadMoreRef = useInfiniteScrollTrigger<HTMLLIElement>({
    enabled: hasMoreRestaurants && !hasNextPageError && !isRestoring,
    isLoading: restaurantsQuery.isFetching,
    onIntersect: () => {
      return restaurantsQuery
        .fetchNextPage({ cancelRefetch: false })
        .catch(() => undefined)
    },
  })

  const categoryLabel =
    selectedCategory.value === DEFAULT_CATEGORY_OPTION.value
      ? '음식 장르 선택'
      : selectedCategory.label

  const applyFilters = (sort: FilterOption, category: FilterOption) => {
    const hasChanged =
      sort.value !== selectedSort.value ||
      category.value !== selectedCategory.value

    if (!hasChanged) {
      setActiveBottomSheet(null)
      return
    }

    const nextSearchParams = new URLSearchParams(searchParams)
    const nextRequestParams = createRestaurantListRequestParams({
      category,
      sort,
      type: restaurantType,
    })

    if (sort.value === defaultSortOption.value) {
      nextSearchParams.delete('sort')
    } else {
      nextSearchParams.set('sort', sort.value)
    }

    if (category.value === DEFAULT_CATEGORY_OPTION.value) {
      nextSearchParams.delete('genre')
    } else {
      nextSearchParams.set('genre', category.value)
    }

    queryClient.removeQueries({
      exact: true,
      queryKey: restaurantListQueryKeys.infiniteList(nextRequestParams),
    })
    setSearchParams(nextSearchParams, { replace: true })
    setActiveBottomSheet(null)
    window.scrollTo({ behavior: 'auto', top: 0 })
  }

  const handleBackClick = () => {
    navigate(ROUTES.home)
  }

  const handleOpenSortSheet = () => {
    setDraftSort(selectedSort)
    setActiveBottomSheet('sort')
  }

  const handleOpenCategorySheet = () => {
    setDraftCategory(selectedCategory)
    setActiveBottomSheet('category')
  }

  const handleCloseBottomSheet = () => {
    setActiveBottomSheet(null)
  }

  const handleSelectSort = (value: string) => {
    const nextOption = getOptionByValue(sortOptions, value)

    if (nextOption) {
      setDraftSort(nextOption)
    }
  }

  const handleChangeSort = (value: string) => {
    const nextOption = getOptionByValue(sortOptions, value)

    if (nextOption) {
      applyFilters(nextOption, selectedCategory)
    }
  }

  const handleSelectCategory = (value: string) => {
    const nextOption = getOptionByValue(CATEGORY_OPTIONS, value)

    if (nextOption) {
      setDraftCategory(nextOption)
    }
  }

  const handleResetSort = () => {
    setDraftSort(defaultSortOption)
    applyFilters(defaultSortOption, selectedCategory)
  }

  const handleResetCategory = () => {
    setDraftCategory(DEFAULT_CATEGORY_OPTION)
    applyFilters(selectedSort, DEFAULT_CATEGORY_OPTION)
  }

  const handleApplySort = () => {
    applyFilters(draftSort, selectedCategory)
  }

  const handleApplyCategory = () => {
    applyFilters(selectedSort, draftCategory)
  }

  const handleClickRestaurant = (restaurantId: string) => {
    saveScrollPosition()
    navigate(getRestaurantDetailPath(restaurantId))
  }

  const handleRetry = () => {
    void restaurantsQuery.refetch()
  }

  const handleRetryNextPage = () => {
    void restaurantsQuery
      .fetchNextPage({ cancelRefetch: false })
      .catch(() => undefined)
  }

  return {
    activeBottomSheet,
    categoryLabel,
    draftCategory,
    draftSort,
    hasMoreRestaurants,
    hasInitialLoadError,
    hasNextPageError,
    isFetchingNextPage: restaurantsQuery.isFetchingNextPage,
    isLoading: restaurantsQuery.isLoading,
    loadMoreRef,
    selectedSort,
    visibleRestaurants,
    handleApplyCategory,
    handleApplySort,
    handleBackClick,
    handleClickRestaurant,
    handleCloseBottomSheet,
    handleChangeSort,
    handleOpenCategorySheet,
    handleOpenSortSheet,
    handleResetCategory,
    handleResetSort,
    handleRetry,
    handleRetryNextPage,
    handleSelectCategory,
    handleSelectSort,
  }
}
