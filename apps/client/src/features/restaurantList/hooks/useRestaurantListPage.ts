import { useState } from 'react'
import { generatePath, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import {
  CATEGORY_OPTIONS,
  DEFAULT_CATEGORY_OPTION,
  RESTAURANT_LIST_PAGE_SIZE,
} from '@/features/restaurantList/constants'
import { useInfiniteRestaurantList } from '@/features/restaurantList/hooks/useInfiniteRestaurantList'
import type { FilterOption, Restaurant } from '@/features/restaurantList/types'

type ActiveBottomSheet = 'sort' | 'category' | null

type UseRestaurantListPageParams = {
  restaurants: Restaurant[]
  sortOptions: FilterOption[]
}

const getOptionByValue = (options: FilterOption[], value: string) => {
  return options.find((option) => option.value === value)
}

export const useRestaurantListPage = ({
  restaurants,
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
  const {
    hasMoreItems: hasMoreRestaurants,
    loadMoreRef,
    visibleItems: visibleRestaurants,
  } = useInfiniteRestaurantList({
    items: restaurants,
    pageSize: RESTAURANT_LIST_PAGE_SIZE,
  })

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
    navigate(generatePath(ROUTES.restaurantDetail, { restaurantId }))
  }

  return {
    activeBottomSheet,
    categoryLabel,
    draftCategory,
    draftSort,
    hasMoreRestaurants,
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
    handleSelectCategory,
    handleSelectSort,
  }
}
