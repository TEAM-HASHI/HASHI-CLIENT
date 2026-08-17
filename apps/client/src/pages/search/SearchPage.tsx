import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { RestaurantResultList } from '@/pages/search/components/RestaurantResultList'
import { SearchErrorState } from '@/pages/search/components/SearchErrorState'
import { SearchFilterBar } from '@/pages/search/components/SearchFilterBar'
import { SearchHeader } from '@/pages/search/components/SearchHeader'
import { SearchIdlePanel } from '@/pages/search/components/SearchIdlePanel'
import { SearchResultSkeleton } from '@/pages/search/components/SearchResultSkeleton'
import {
  DEFAULT_FOOD_CATEGORY_VALUE,
  DEFAULT_SORT_VALUE,
  foodCategoryOptions,
  sortOptions,
} from '@/pages/search/constants/searchFilters'
import { useRecentSearchKeywords } from '@/pages/search/hooks/useRecentSearchKeywords'
import { useSearchFilterSheet } from '@/pages/search/hooks/useSearchFilterSheet'
import { useSearchRestaurantResults } from '@/pages/search/hooks/useSearchRestaurantResults'
import { useSearchUrlState } from '@/pages/search/hooks/useSearchUrlState'
import { useSearchKeywordRecommendationsQuery } from '@/pages/search/queries/useSearchKeywordRecommendationsQuery'
import { FilterBottomSheet } from '@/shared/components/filterBottomSheet'
import { ListEmptyState } from '@/shared/components/listEmptyState'
import { cn } from '@/shared/utils'

const getOptionLabel = <TValue extends string>(
  options: readonly { label: string; value: TValue }[],
  value: TValue,
) => {
  return options.find((option) => option.value === value)?.label ?? ''
}

export const SearchPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const {
    category: foodCategoryValue,
    keyword: appliedKeyword,
    searchParams,
    sort: sortValue,
    updateSearchUrlState,
  } = useSearchUrlState()
  const [keywordDraft, setKeywordDraft] = useState({
    appliedKeyword,
    value: appliedKeyword,
  })
  const { recentSearchKeywords, saveRecentSearchKeyword } =
    useRecentSearchKeywords()
  const searchKeywordRecommendationsQuery =
    useSearchKeywordRecommendationsQuery({ enabled: searchParams === null })
  const {
    loadMoreRef,
    query: searchRestaurantsQuery,
    restaurants,
    retry: retrySearchRestaurants,
  } = useSearchRestaurantResults(searchParams)
  const sortSheet = useSearchFilterSheet({
    appliedValue: sortValue,
    defaultValue: DEFAULT_SORT_VALUE,
    onApplyValue: (sort) => {
      updateSearchUrlState({ sort })
    },
    options: sortOptions,
  })
  const foodCategorySheet = useSearchFilterSheet({
    appliedValue: foodCategoryValue,
    defaultValue: DEFAULT_FOOD_CATEGORY_VALUE,
    onApplyValue: (category) => {
      updateSearchUrlState({ category })
    },
    options: foodCategoryOptions,
  })
  const isSearchIdle = searchParams === null
  const sortLabel = getOptionLabel(sortOptions, sortValue)
  const foodCategoryLabel =
    foodCategoryValue === DEFAULT_FOOD_CATEGORY_VALUE
      ? '음식 장르 선택'
      : getOptionLabel(foodCategoryOptions, foodCategoryValue)
  const recommendedSearchKeywords = searchKeywordRecommendationsQuery.data ?? []

  if (keywordDraft.appliedKeyword !== appliedKeyword) {
    setKeywordDraft({
      appliedKeyword,
      value: appliedKeyword,
    })
  }

  const keyword = keywordDraft.value
  const setKeyword = (value: string) => {
    setKeywordDraft({ appliedKeyword, value })
  }

  useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  const submitSearch = (nextKeyword = keyword) => {
    const normalizedKeyword = nextKeyword.trim()

    if (!normalizedKeyword) {
      setKeyword('')
      updateSearchUrlState({ keyword: '' })
      return
    }

    setKeyword(normalizedKeyword)
    updateSearchUrlState({ keyword: normalizedKeyword })
    saveRecentSearchKeyword(normalizedKeyword)
  }

  const handleBackClick = () => {
    if (location.key !== 'default') {
      navigate(-1)
      return
    }

    navigate(ROUTES.home)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <div className="app-mobile-fixed-top z-fixed bg-white">
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
              foodCategorySheet.onOpenChange(true)
            }}
            onSortClick={() => {
              sortSheet.onOpenChange(true)
            }}
            sortLabel={sortLabel}
          />
        )}
      </div>
      <div
        className={cn(
          'flex flex-1 flex-col',
          isSearchIdle ? 'pt-[83px]' : 'pt-[122px]',
        )}
      >
        {isSearchIdle ? (
          <SearchIdlePanel
            recentSearchKeywords={recentSearchKeywords}
            recommendedSearchKeywords={recommendedSearchKeywords}
            onKeywordSelect={submitSearch}
          />
        ) : (
          <>
            {searchRestaurantsQuery.isLoading ? (
              <SearchResultSkeleton />
            ) : searchRestaurantsQuery.isError ? (
              <SearchErrorState onRetry={retrySearchRestaurants} />
            ) : restaurants.length > 0 ? (
              <>
                <RestaurantResultList restaurants={restaurants} />
                <div ref={loadMoreRef} aria-hidden="true" />
                {searchRestaurantsQuery.isFetchingNextPage && (
                  <SearchResultSkeleton />
                )}
              </>
            ) : (
              <ListEmptyState
                className="min-h-0 flex-1 pb-[122px]"
                description="검색된 식당이 없습니다."
              />
            )}
          </>
        )}
      </div>
      <FilterBottomSheet {...sortSheet} title="정렬 순서" />
      <FilterBottomSheet {...foodCategorySheet} title="음식 장르 선택" />
    </div>
  )
}
