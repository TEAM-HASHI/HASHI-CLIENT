import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { getRestaurantDetailPath } from '@/app/router/routePaths'
import {
  CATEGORY_OPTIONS,
  DEFAULT_CATEGORY_OPTION,
} from '@/features/restaurantList/constants'
import { restaurantListQueryKeys } from '@/features/restaurantList/queries/restaurantListQueryKeys'
import { useRestaurantListRestoration } from '@/features/restaurantList/hooks/useRestaurantListRestoration'
import {
  restaurantsInfiniteQueryOptions,
  type RestaurantsInfiniteData,
} from '@/features/restaurantList/queries/useRestaurantsInfiniteQuery'
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

export const useRestaurantListContent = ({
  restaurantType,
  sortOptions,
}: UseRestaurantListContentParams) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const defaultSortOption = sortOptions[0]
  const { snapshot, saveSnapshot, clearSnapshot, restoreScroll } =
    useRestaurantListRestoration(restaurantType)
  const resetScrollPending = useRef(false)
  const didHydrateSnapshot = useRef(false)
  const [activeBottomSheet, setActiveBottomSheet] =
    useState<ActiveBottomSheet>(null)
  const [selectedSort, setSelectedSort] = useState(
    () =>
      getOptionByValue(sortOptions, snapshot?.sort ?? '') ?? defaultSortOption,
  )
  const [draftSort, setDraftSort] = useState(defaultSortOption)
  const [selectedCategory, setSelectedCategory] = useState(
    () =>
      getOptionByValue(CATEGORY_OPTIONS, snapshot?.category ?? '') ??
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
  const isRestoredFilter =
    snapshot?.sort === selectedSort.value &&
    snapshot.category === selectedCategory.value

  useEffect(() => {
    if (!resetScrollPending.current || activeBottomSheet !== null) return

    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      resetScrollPending.current = false
    })
    return () => cancelAnimationFrame(frame)
  }, [activeBottomSheet, requestParams])

  const restaurantsQuery = useInfiniteQuery({
    ...restaurantsInfiniteQueryOptions(requestParams),
    throwOnError: false,
    initialData: isRestoredFilter ? snapshot.data : undefined,
    refetchOnMount: !isRestoredFilter,
  })

  useLayoutEffect(() => {
    if (!isRestoredFilter || !snapshot.data || didHydrateSnapshot.current)
      return

    queryClient.setQueryData(
      restaurantListQueryKeys.infiniteList(requestParams),
      snapshot.data,
    )
    didHydrateSnapshot.current = true
  }, [isRestoredFilter, snapshot, queryClient, requestParams])

  const isRestoringPages =
    Boolean(snapshot) &&
    (restaurantsQuery.data?.pages.length ?? 0) < (snapshot?.pageCount ?? 0) &&
    (restaurantsQuery.isPending || Boolean(restaurantsQuery.hasNextPage))

  const { fetchNextPage, isFetching, isError } = restaurantsQuery
  useEffect(() => {
    if (
      isRestoringPages &&
      !isFetching &&
      !isError &&
      restaurantsQuery.hasNextPage
    ) {
      const cachedData = queryClient.getQueryData<RestaurantsInfiniteData>(
        restaurantListQueryKeys.infiniteList(requestParams),
      )
      if ((cachedData?.pages.length ?? 0) >= (snapshot?.pageCount ?? 0)) return

      void fetchNextPage({ cancelRefetch: false })
    }
  }, [
    isRestoringPages,
    isFetching,
    isError,
    restaurantsQuery.hasNextPage,
    restaurantsQuery.data?.pages.length,
    fetchNextPage,
    queryClient,
    requestParams,
    snapshot?.pageCount,
  ])

  useEffect(() => {
    if (restaurantsQuery.data && !isRestoringPages && !isFetching)
      return restoreScroll()
  }, [restaurantsQuery.data, isRestoringPages, isFetching, restoreScroll])

  const loadMoreRef = useInfiniteScrollTrigger<HTMLLIElement>({
    enabled:
      Boolean(restaurantsQuery.hasNextPage) &&
      !isRestoringPages &&
      !restaurantsQuery.isFetchNextPageError,
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
  }

  const handleResetCategory = () => {
    setDraftCategory(DEFAULT_CATEGORY_OPTION)
  }

  const applyFilters = (sort: FilterOption, category: FilterOption) => {
    resetScrollPending.current = true
    clearSnapshot()
    const nextParams = createRestaurantListRequestParams({
      category,
      sort,
      type: restaurantType,
    })

    queryClient.removeQueries({
      exact: true,
      queryKey: restaurantListQueryKeys.infiniteList(nextParams),
    })

    setSelectedSort(sort)
    setSelectedCategory(category)
    setActiveBottomSheet(null)
  }

  const handleApplySort = () => applyFilters(draftSort, selectedCategory)
  const handleApplyCategory = () => applyFilters(selectedSort, draftCategory)

  const handleClickRestaurant = (restaurantId: string) => {
    if (restaurantsQuery.data) {
      saveSnapshot({
        sort: selectedSort.value,
        category: selectedCategory.value,
        data: restaurantsQuery.data,
      })
    }
    navigate(getRestaurantDetailPath(restaurantId))
  }

  const handleRetry = () => {
    if (restaurantsQuery.isFetchNextPageError) {
      void restaurantsQuery.fetchNextPage()
    } else {
      void restaurantsQuery.refetch()
    }
  }

  return {
    activeBottomSheet,
    categoryLabel,
    draftCategory,
    draftSort,
    hasMoreRestaurants,
    isFetchingNextPage: restaurantsQuery.isFetchingNextPage,
    isLoading: restaurantsQuery.isLoading,
    isError: restaurantsQuery.isError && !restaurantsQuery.data,
    isFetchNextPageError: restaurantsQuery.isFetchNextPageError,
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
