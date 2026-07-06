import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { RestaurantResultList } from '@/pages/search/components/RestaurantResultList'
import { SearchEmptyState } from '@/pages/search/components/SearchEmptyState'
import { SearchErrorState } from '@/pages/search/components/SearchErrorState'
import { SearchFilterBar } from '@/pages/search/components/SearchFilterBar'
import { SearchHeader } from '@/pages/search/components/SearchHeader'
import { SearchIdlePanel } from '@/pages/search/components/SearchIdlePanel'
import { SearchResultSkeleton } from '@/pages/search/components/SearchResultSkeleton'
import {
  foodCategoryOptions,
  sortOptions,
} from '@/pages/search/constants/searchFilters'
import { useRecentSearchKeywords } from '@/pages/search/hooks/useRecentSearchKeywords'
import { useSearchRestaurantsQuery } from '@/pages/search/hooks/useSearchRestaurantsQuery'
import type { FoodCategoryValue, SearchSortValue } from '@/pages/search/types'
import { FilterBottomSheet } from '@/shared/components/filterBottomSheet'

const DEFAULT_SORT_VALUE = 'default' satisfies SearchSortValue
const DEFAULT_FOOD_CATEGORY_VALUE = 'all' satisfies FoodCategoryValue

const getOptionLabel = <TValue extends string>(
  options: readonly { label: string; value: TValue }[],
  value: TValue,
) => {
  return options.find((option) => option.value === value)?.label ?? ''
}

export const SearchPage = () => {
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

  const handleKeywordSelect = (nextKeyword: string) => {
    submitSearch(nextKeyword)
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

  const sortLabel = getOptionLabel(sortOptions, sortValue)
  const foodCategoryLabel =
    foodCategoryValue === DEFAULT_FOOD_CATEGORY_VALUE
      ? '음식 장르 선택'
      : getOptionLabel(foodCategoryOptions, foodCategoryValue)

  return (
    <div className="min-h-dvh bg-white">
      <div className="sticky top-0 z-10 bg-white">
        <SearchHeader
          inputRef={searchInputRef}
          keyword={keyword}
          onBackClick={handleBackClick}
          onKeywordChange={setKeyword}
          onSearchSubmit={() => {
            submitSearch()
          }}
        />
        {!isSearchIdle && (
          <SearchFilterBar
            categoryLabel={foodCategoryLabel}
            onCategoryClick={() => {
              handleFoodCategorySheetOpenChange(true)
            }}
            onSortClick={() => {
              handleSortSheetOpenChange(true)
            }}
            sortLabel={sortLabel}
          />
        )}
      </div>
      {isSearchIdle ? (
        <SearchIdlePanel
          recentSearchKeywords={recentSearchKeywords}
          onKeywordSelect={handleKeywordSelect}
        />
      ) : searchRestaurantsQuery.isLoading ? (
        <SearchResultSkeleton />
      ) : searchRestaurantsQuery.isError ? (
        <SearchErrorState
          onRetry={() => {
            void searchRestaurantsQuery.refetch()
          }}
        />
      ) : restaurants.length > 0 ? (
        <RestaurantResultList restaurants={restaurants} />
      ) : (
        <SearchEmptyState />
      )}
      <FilterBottomSheet
        open={isSortSheetOpen}
        onApply={handleSortApply}
        onOpenChange={handleSortSheetOpenChange}
        onReset={handleSortReset}
        onSelect={(value) => {
          setPendingSortValue(value as SearchSortValue)
        }}
        options={sortOptions}
        selectedValue={pendingSortValue}
        title="정렬 순서"
      />
      <FilterBottomSheet
        open={isFoodCategorySheetOpen}
        onApply={handleFoodCategoryApply}
        onOpenChange={handleFoodCategorySheetOpenChange}
        onReset={handleFoodCategoryReset}
        onSelect={(value) => {
          setPendingFoodCategoryValue(value as FoodCategoryValue)
        }}
        options={foodCategoryOptions}
        selectedValue={pendingFoodCategoryValue}
        title="음식 장르 선택"
      />
    </div>
  )
}
