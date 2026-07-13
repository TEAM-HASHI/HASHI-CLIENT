import { RestaurantResultList } from '@/pages/search/components/RestaurantResultList'
import { SearchEmptyState } from '@/pages/search/components/SearchEmptyState'
import { SearchErrorState } from '@/pages/search/components/SearchErrorState'
import { SearchFilterBar } from '@/pages/search/components/SearchFilterBar'
import { SearchHeader } from '@/pages/search/components/SearchHeader'
import { SearchIdlePanel } from '@/pages/search/components/SearchIdlePanel'
import { SearchResultSkeleton } from '@/pages/search/components/SearchResultSkeleton'
import { useSearchPage } from '@/pages/search/hooks/useSearchPage'
import { FilterBottomSheet } from '@/shared/components/filterBottomSheet'
import { cn } from '@/shared/utils'

export const SearchPage = () => {
  const {
    filterLabels,
    foodCategorySheet,
    keyword,
    loadMoreRef,
    recentSearchKeywords,
    recommendedSearchKeywords,
    restaurants,
    searchInputRef,
    searchRestaurantsQuery,
    sortSheet,
    status,
    onBackClick,
    onFoodCategoryFilterClick,
    onKeywordChange,
    onKeywordSelect,
    onSearchRetry,
    onSearchSubmit,
    onSortFilterClick,
  } = useSearchPage()
  const isSearchIdle = status.isSearchIdle

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <div className="app-mobile-fixed-top z-fixed bg-white">
        <SearchHeader
          inputRef={searchInputRef}
          keyword={keyword}
          onBackClick={onBackClick}
          onKeywordChange={onKeywordChange}
          onSearchSubmit={onSearchSubmit}
        />
        {!isSearchIdle && (
          <SearchFilterBar
            categoryLabel={filterLabels.foodCategory}
            onCategoryClick={onFoodCategoryFilterClick}
            onSortClick={onSortFilterClick}
            sortLabel={filterLabels.sort}
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
            onKeywordSelect={onKeywordSelect}
          />
        ) : (
          <>
            {searchRestaurantsQuery.isLoading ? (
              <SearchResultSkeleton />
            ) : searchRestaurantsQuery.isError ? (
              <SearchErrorState onRetry={onSearchRetry} />
            ) : restaurants.length > 0 ? (
              <>
                <RestaurantResultList restaurants={restaurants} />
                <div ref={loadMoreRef} aria-hidden="true" />
                {searchRestaurantsQuery.isFetchingNextPage && (
                  <SearchResultSkeleton />
                )}
              </>
            ) : (
              <SearchEmptyState />
            )}
          </>
        )}
      </div>
      <FilterBottomSheet {...sortSheet} />
      <FilterBottomSheet {...foodCategorySheet} />
    </div>
  )
}
