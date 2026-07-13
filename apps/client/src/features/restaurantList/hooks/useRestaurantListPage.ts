import { useInfiniteQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import {
  CATEGORY_OPTIONS,
  DEFAULT_CATEGORY_OPTION,
} from '@/features/restaurantList/constants'
import { restaurantsInfiniteQueryOptions } from '@/features/restaurantList/queries/useRestaurantsInfiniteQuery'
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

type UseRestaurantListPageParams = {
  restaurantType: RestaurantListCurationType
  sortOptions: FilterOption[]
}

const getOptionByValue = (options: FilterOption[], value: string) => {
  return options.find((option) => option.value === value)
}

const getRestaurantDetailPath = (restaurantId: string) => {
  return ROUTES.restaurantDetail.replace(
    ':restaurantId',
    encodeURIComponent(restaurantId),
  )
}

export const useRestaurantListPage = ({
  restaurantType,
  sortOptions,
}: UseRestaurantListPageParams) => {
  const navigate = useNavigate()
  const defaultSortOption = sortOptions[0]
  const [activeBottomSheet, setActiveBottomSheet] =
    useState<ActiveBottomSheet>(null)
  const [selectedSort, setSelectedSort] = useState(defaultSortOption)
  const [draftSort, setDraftSort] = useState(defaultSortOption)
  const [selectedCategory, setSelectedCategory] = useState(
    DEFAULT_CATEGORY_OPTION,
  )
  const [draftCategory, setDraftCategory] = useState(DEFAULT_CATEGORY_OPTION)

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
  const loadMoreRef = useInfiniteScrollTrigger<HTMLLIElement>({
    enabled: Boolean(restaurantsQuery.hasNextPage),
    isLoading: restaurantsQuery.isFetchingNextPage,
    onIntersect: restaurantsQuery.fetchNextPage,
  })
  const visibleRestaurants =
    restaurantsQuery.data?.pages.flatMap((page) =>
      page.restaurants.flatMap((restaurant) => {
        const mappedRestaurant = mapRestaurantSummaryToRestaurant(restaurant)

        return mappedRestaurant ? [mappedRestaurant] : []
      }),
    ) ?? []
  const hasMoreRestaurants = Boolean(restaurantsQuery.hasNextPage)

  const categoryLabel =
    selectedCategory.value === DEFAULT_CATEGORY_OPTION.value
      ? '음식 장르 선택'
      : selectedCategory.label

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

  const handleSelectCategory = (value: string) => {
    const nextOption = getOptionByValue(CATEGORY_OPTIONS, value)

    if (nextOption) {
      setDraftCategory(nextOption)
    }
  }

  const handleResetSort = () => {
    setDraftSort(defaultSortOption)
    setSelectedSort(defaultSortOption)
  }

  const handleResetCategory = () => {
    setDraftCategory(DEFAULT_CATEGORY_OPTION)
    setSelectedCategory(DEFAULT_CATEGORY_OPTION)
  }

  const handleApplySort = () => {
    setSelectedSort(draftSort)
    setActiveBottomSheet(null)
  }

  const handleApplyCategory = () => {
    setSelectedCategory(draftCategory)
    setActiveBottomSheet(null)
  }

  const handleClickRestaurant = (restaurantId: string) => {
    navigate(getRestaurantDetailPath(restaurantId))
  }

  const handleRetry = () => {
    void restaurantsQuery.refetch()
  }

  return {
    activeBottomSheet,
    categoryLabel,
    draftCategory,
    draftSort,
    hasMoreRestaurants,
    isFetchingNextPage: restaurantsQuery.isFetchingNextPage,
    isLoading: restaurantsQuery.isLoading,
    isError: restaurantsQuery.isError,
    loadMoreRef,
    selectedSort,
    visibleRestaurants,
    handleApplyCategory,
    handleApplySort,
    handleBackClick,
    handleClickRestaurant,
    handleCloseBottomSheet,
    handleOpenCategorySheet,
    handleOpenSortSheet,
    handleResetCategory,
    handleResetSort,
    handleRetry,
    handleSelectCategory,
    handleSelectSort,
  }
}
