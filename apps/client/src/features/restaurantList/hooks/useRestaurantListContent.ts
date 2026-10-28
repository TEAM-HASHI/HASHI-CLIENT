import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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
import { scrollPageTo } from '@/shared/utils/pageScroll'

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
  const { snapshot, saveSnapshot, clearSnapshot, restoreScroll, isRestoring } =
    useRestaurantListRestoration(restaurantType)
  const didHydrateSnapshot = useRef(false)
  const resetScrollPending = useRef(false)
  const selectedSort = getSelectedOption(
    sortOptions,
    searchParams.get('sort') ?? snapshot?.sort ?? null,
    defaultSortOption,
  )
  const selectedCategory = getSelectedOption(
    CATEGORY_OPTIONS,
    restaurantType === 'sns-hot'
      ? null
      : (searchParams.get('genre') ?? snapshot?.category ?? null),
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
  const isRestoredFilter =
    snapshot?.sort === selectedSort.value &&
    snapshot.category === selectedCategory.value

  useEffect(() => {
    if (!resetScrollPending.current || activeBottomSheet !== null) return
    const frame = requestAnimationFrame(() => {
      scrollPageTo({ top: 0, left: 0, behavior: 'auto' })
      resetScrollPending.current = false
    })
    return () => cancelAnimationFrame(frame)
  }, [activeBottomSheet, requestParams])

  const restaurantsQuery = useInfiniteQuery({
    ...restaurantsInfiniteQueryOptions(requestParams),
    throwOnError: false,
    initialData: isRestoredFilter ? snapshot.data : undefined,
    refetchOnMount: restaurantType === 'sns-hot' || !isRestoredFilter,
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
  const pageCount = restaurantsQuery.data?.pages.length ?? 0
  const needsMoreRestorationPages =
    isRestoring &&
    Boolean(snapshot) &&
    pageCount < (snapshot?.pageCount ?? 0) &&
    hasMoreRestaurants
  const hasRestorationError =
    needsMoreRestorationPages && restaurantsQuery.isError && pageCount > 0
  const { fetchNextPage, isFetching, isPending, isError } = restaurantsQuery

  useEffect(() => {
    if (!isRestoring || isPending || isFetching || pageCount === 0) return
    if (needsMoreRestorationPages) {
      if (!isError) {
        const cachedData = queryClient.getQueryData<{ pages: unknown[] }>(
          restaurantListQueryKeys.infiniteList(requestParams),
        )
        if ((cachedData?.pages.length ?? 0) >= (snapshot?.pageCount ?? 0))
          return
        void fetchNextPage({ cancelRefetch: false }).catch(() => undefined)
      }
      return
    }
    return restoreScroll()
  }, [
    isRestoring,
    isPending,
    isFetching,
    pageCount,
    needsMoreRestorationPages,
    isError,
    fetchNextPage,
    queryClient,
    requestParams,
    snapshot?.pageCount,
    restoreScroll,
  ])
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

  const applyFilters = (
    sort: FilterOption,
    category: FilterOption,
    force = false,
  ) => {
    const hasChanged =
      sort.value !== selectedSort.value ||
      category.value !== selectedCategory.value

    if (!hasChanged && !force) {
      setActiveBottomSheet(null)
      return
    }

    clearSnapshot()
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
    if (restaurantType === 'sns-hot') {
      scrollPageTo({ behavior: 'auto', top: 0 })
    } else {
      resetScrollPending.current = true
    }
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
  }

  const handleResetCategory = () => {
    setDraftCategory(DEFAULT_CATEGORY_OPTION)
  }

  const handleApplySort = () => {
    applyFilters(draftSort, selectedCategory, true)
  }

  const handleApplyCategory = () => {
    applyFilters(selectedSort, draftCategory, true)
  }

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
