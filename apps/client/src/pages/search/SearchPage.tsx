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
  const searchPage = useSearchPage()
  const isSearchIdle = searchPage.status.isSearchIdle

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <div className="app-mobile-fixed-top z-fixed bg-white">
        <SearchHeader
          inputRef={searchPage.searchInputRef}
          keyword={searchPage.keyword}
          onBackClick={searchPage.onBackClick}
          onKeywordChange={searchPage.onKeywordChange}
          onSearchSubmit={searchPage.onSearchSubmit}
        />
        {!isSearchIdle && (
          <SearchFilterBar
            categoryLabel={searchPage.filterLabels.foodCategory}
            onCategoryClick={searchPage.onFoodCategoryFilterClick}
            onSortClick={searchPage.onSortFilterClick}
            sortLabel={searchPage.filterLabels.sort}
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
            recentSearchKeywords={searchPage.recentSearchKeywords}
            recommendedSearchKeywords={searchPage.recommendedSearchKeywords}
            onKeywordSelect={searchPage.onKeywordSelect}
          />
        ) : (
          <>
            {searchPage.searchRestaurantsQuery.isLoading ? (
              <SearchResultSkeleton />
            ) : searchPage.searchRestaurantsQuery.isError ? (
              <SearchErrorState onRetry={searchPage.onSearchRetry} />
            ) : searchPage.restaurants.length > 0 ? (
              <RestaurantResultList restaurants={searchPage.restaurants} />
            ) : (
              <SearchEmptyState />
            )}
          </>
        )}
      </div>
      <FilterBottomSheet {...searchPage.sortSheet} />
      <FilterBottomSheet {...searchPage.foodCategorySheet} />
    </div>
  )
}
