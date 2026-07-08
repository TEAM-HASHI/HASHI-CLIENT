import { RestaurantResultList } from '@/pages/search/components/RestaurantResultList'
import { SearchEmptyState } from '@/pages/search/components/SearchEmptyState'
import { SearchErrorState } from '@/pages/search/components/SearchErrorState'
import { SearchFilterBar } from '@/pages/search/components/SearchFilterBar'
import { SearchHeader } from '@/pages/search/components/SearchHeader'
import { SearchIdlePanel } from '@/pages/search/components/SearchIdlePanel'
import { SearchResultSkeleton } from '@/pages/search/components/SearchResultSkeleton'
import { useSearchPage } from '@/pages/search/hooks/useSearchPage'
import { FilterBottomSheet } from '@/shared/components/filterBottomSheet'

export const SearchPage = () => {
  const searchPage = useSearchPage()

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
      </div>
      <div className="flex flex-1 flex-col pt-[83px]">
        {searchPage.status.isSearchIdle ? (
          <SearchIdlePanel
            recentSearchKeywords={searchPage.recentSearchKeywords}
            recommendedSearchKeywords={searchPage.recommendedSearchKeywords}
            onKeywordSelect={searchPage.onKeywordSelect}
          />
        ) : (
          <>
            <SearchFilterBar
              categoryLabel={searchPage.filterLabels.foodCategory}
              onCategoryClick={searchPage.onFoodCategoryFilterClick}
              onSortClick={searchPage.onSortFilterClick}
              sortLabel={searchPage.filterLabels.sort}
            />
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
