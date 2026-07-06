import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import {
  foodCategoryOptions,
  sortOptions,
} from '@/pages/search/constants/searchFilters'
import { useRecentSearchKeywords } from '@/pages/search/hooks/useRecentSearchKeywords'
import { useSearchRestaurantsQuery } from '@/pages/search/hooks/useSearchRestaurantsQuery'
import { recommendedSearchKeywords } from '@/pages/search/mocks/searchContent.mock'
import type { FoodCategoryValue, SearchSortValue } from '@/pages/search/types'

const DEFAULT_SORT_VALUE = 'default' satisfies SearchSortValue
const DEFAULT_FOOD_CATEGORY_VALUE = 'all' satisfies FoodCategoryValue

const getOptionLabel = <TValue extends string>(
  options: readonly { label: string; value: TValue }[],
  value: TValue,
) => {
  return options.find((option) => option.value === value)?.label ?? ''
}

export const useSearchPage = () => {
  const navigate = useNavigate()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [keyword, setKeyword] = useState('')
  const [submittedKeyword, setSubmittedKeyword] = useState('')
  const [sortValue, setSortValue] =
    useState<SearchSortValue>(DEFAULT_SORT_VALUE)
  const [pendingSortValue, setPendingSortValue] =
    useState<SearchSortValue>(DEFAULT_SORT_VALUE)
  const [foodCategoryValue, setFoodCategoryValue] = useState<FoodCategoryValue>(
    DEFAULT_FOOD_CATEGORY_VALUE,
  )
  const [pendingFoodCategoryValue, setPendingFoodCategoryValue] =
    useState<FoodCategoryValue>(DEFAULT_FOOD_CATEGORY_VALUE)
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false)
  const [isFoodCategorySheetOpen, setIsFoodCategorySheetOpen] = useState(false)
  const { recentSearchKeywords, saveRecentSearchKeyword } =
    useRecentSearchKeywords()

  const searchParams = useMemo(() => {
    const normalizedKeyword = submittedKeyword.trim()

    if (!normalizedKeyword) {
      return null
    }

    return {
      category: foodCategoryValue,
      keyword: normalizedKeyword,
      sort: sortValue,
    }
  }, [foodCategoryValue, sortValue, submittedKeyword])

  const searchRestaurantsQuery = useSearchRestaurantsQuery(searchParams)
  const restaurants = searchRestaurantsQuery.data ?? []
  const isSearchIdle = searchParams === null
  const sortLabel = getOptionLabel(sortOptions, sortValue)
  const foodCategoryLabel =
    foodCategoryValue === DEFAULT_FOOD_CATEGORY_VALUE
      ? '음식 장르 선택'
      : getOptionLabel(foodCategoryOptions, foodCategoryValue)

  useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  const submitSearch = (nextKeyword = keyword) => {
    const normalizedKeyword = nextKeyword.trim()

    if (!normalizedKeyword) {
      setKeyword('')
      setSubmittedKeyword('')
      return
    }

    setKeyword(normalizedKeyword)
    setSubmittedKeyword(normalizedKeyword)
    saveRecentSearchKeyword(normalizedKeyword)
  }

  const handleBackClick = () => {
    if (window.history.length > 1) {
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
    setSortValue(pendingSortValue)
    setIsSortSheetOpen(false)
  }

  const handleFoodCategoryApply = () => {
    setFoodCategoryValue(pendingFoodCategoryValue)
    setIsFoodCategorySheetOpen(false)
  }

  const handleSortReset = () => {
    setPendingSortValue(DEFAULT_SORT_VALUE)
    setSortValue(DEFAULT_SORT_VALUE)
  }

  const handleFoodCategoryReset = () => {
    setPendingFoodCategoryValue(DEFAULT_FOOD_CATEGORY_VALUE)
    setFoodCategoryValue(DEFAULT_FOOD_CATEGORY_VALUE)
  }

  const handleSortSelect = (value: string) => {
    setPendingSortValue(value as SearchSortValue)
  }

  const handleFoodCategorySelect = (value: string) => {
    setPendingFoodCategoryValue(value as FoodCategoryValue)
  }

  const handleSearchRetry = () => {
    void searchRestaurantsQuery.refetch()
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
    recentSearchKeywords,
    recommendedSearchKeywords,
    restaurants,
    searchInputRef,
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
