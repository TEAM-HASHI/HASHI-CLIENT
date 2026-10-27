import { useEffect, useRef, useState } from 'react'
import { showToast } from '@hashi/hds-ui'
import { useLocation, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { parseMapSearchContext } from '@/features/mapSearch/utils/parseMapSearchContext'
import { RestaurantResultList } from '@/pages/search/components/RestaurantResultList'
import { SearchErrorState } from '@/pages/search/components/SearchErrorState'
import { SearchFilterBar } from '@/pages/search/components/SearchFilterBar'
import { SearchHeader } from '@/pages/search/components/SearchHeader'
import { SearchIdlePanel } from '@/pages/search/components/SearchIdlePanel'
import { SearchResultSkeleton } from '@/pages/search/components/SearchResultSkeleton'
import {
  getSearchKeywordError,
  MAX_SEARCH_KEYWORD_LENGTH,
} from '@/pages/search/utils/searchKeyword'
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
import searchToastWarningIcon from '@/shared/assets/icons/search-toast-warning.svg'
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
  const mapContext = parseMapSearchContext(location.state)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const {
    category: foodCategoryValue,
    keyword: urlKeyword,
    searchParams,
    sort: sortValue,
    updateSearchUrlState,
  } = useSearchUrlState()
  const appliedKeyword = mapContext?.keyword ?? urlKeyword
  const inputKeyword = mapContext
    ? appliedKeyword.slice(0, MAX_SEARCH_KEYWORD_LENGTH)
    : appliedKeyword
  const [keywordDraft, setKeywordDraft] = useState({
    appliedKeyword,
    value: inputKeyword,
  })
  const {
    recentSearchKeywords,
    saveRecentSearchKeyword,
    clearRecentSearchKeywords,
  } = useRecentSearchKeywords()
  const searchKeywordRecommendationsQuery =
    useSearchKeywordRecommendationsQuery({ enabled: searchParams === null })
  const {
    loadMoreRef,
    query: searchRestaurantsQuery,
    restaurants,
    retry: retrySearchRestaurants,
  } = useSearchRestaurantResults(mapContext ? null : searchParams)
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
  const isSearchIdle = !!mapContext || searchParams === null
  const sortLabel = getOptionLabel(sortOptions, sortValue)
  const foodCategoryLabel =
    foodCategoryValue === DEFAULT_FOOD_CATEGORY_VALUE
      ? '음식 장르 선택'
      : getOptionLabel(foodCategoryOptions, foodCategoryValue)
  const recommendedSearchKeywords = searchKeywordRecommendationsQuery.data ?? []

  if (keywordDraft.appliedKeyword !== appliedKeyword) {
    setKeywordDraft({
      appliedKeyword,
      value: inputKeyword,
    })
  }

  const keyword = keywordDraft.value
  const setKeyword = (value: string) => {
    setKeywordDraft({ appliedKeyword, value })
  }

  const shouldFocusOnMount = useRef(searchParams === null)
  useEffect(() => {
    // POP 복귀에서 검색창 focus가 저장 위치를 다시 끌어올리지 않게 합니다.
    if (shouldFocusOnMount.current)
      searchInputRef.current?.focus({ preventScroll: true })
  }, [])

  const submitSearch = (nextKeyword = keyword) => {
    const normalizedKeyword = nextKeyword.trim()
    const error = getSearchKeywordError(normalizedKeyword)
    if (error) {
      showToast({
        children: error,
        icon: <img src={searchToastWarningIcon} alt="" className="size-6.5" />,
      })
      return
    }

    if (mapContext) {
      saveRecentSearchKeyword(normalizedKeyword)
      navigate(ROUTES.map, {
        replace: true,
        state: { source: 'map', keyword: normalizedKeyword },
      })
      return
    }

    setKeyword(normalizedKeyword)
    updateSearchUrlState({
      keyword: normalizedKeyword,
      sort: DEFAULT_SORT_VALUE,
      category: DEFAULT_FOOD_CATEGORY_VALUE,
    })
    saveRecentSearchKeyword(normalizedKeyword)
    searchInputRef.current?.blur()
  }

  const handleBackClick = () => {
    if (mapContext) {
      navigate(ROUTES.map, { replace: true })
      return
    }
    if (location.key !== 'default') {
      navigate(-1)
      return
    }

    navigate(ROUTES.home)
  }

  const handleKeywordClear = () => {
    setKeyword('')
    if (mapContext) return
    updateSearchUrlState({
      keyword: '',
      sort: DEFAULT_SORT_VALUE,
      category: DEFAULT_FOOD_CATEGORY_VALUE,
    })
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <div className="app-mobile-fixed-top z-fixed bg-white">
        <SearchHeader
          inputRef={searchInputRef}
          keyword={keyword}
          onBackClick={handleBackClick}
          onKeywordChange={setKeyword}
          onKeywordClear={handleKeywordClear}
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
          isSearchIdle ? 'pt-[79px]' : 'pt-[127px]',
        )}
      >
        {isSearchIdle ? (
          <SearchIdlePanel
            recentSearchKeywords={recentSearchKeywords}
            recommendedSearchKeywords={recommendedSearchKeywords}
            onKeywordSelect={submitSearch}
            onRecentKeywordsClear={clearRecentSearchKeywords}
          />
        ) : (
          <>
            {searchRestaurantsQuery.isLoading ? (
              <SearchResultSkeleton />
            ) : searchRestaurantsQuery.isError && restaurants.length === 0 ? (
              <SearchErrorState onRetry={retrySearchRestaurants} />
            ) : restaurants.length > 0 ? (
              <>
                <RestaurantResultList restaurants={restaurants} />
                {searchRestaurantsQuery.isError && (
                  <SearchErrorState onRetry={retrySearchRestaurants} />
                )}
                <div ref={loadMoreRef} aria-hidden="true" />
                {searchRestaurantsQuery.isFetchingNextPage && (
                  <SearchResultSkeleton />
                )}
              </>
            ) : (
              <ListEmptyState
                className="min-h-0 flex-1 pb-[127px]"
                description="검색된 식당이 없습니다."
              />
            )}
          </>
        )}
      </div>
      <FilterBottomSheet
        {...sortSheet}
        layout="restaurant-list"
        title="정렬순"
      />
      <FilterBottomSheet
        {...foodCategorySheet}
        layout="restaurant-list"
        title="음식 장르"
      />
    </div>
  )
}
