import { BackIcon } from '@hashi/hds-icons'
import { Button, Header, IconButton } from '@hashi/hds-ui'

import { RestaurantCard } from '@/features/restaurantList/components/RestaurantCard'
import { RestaurantFilterBar } from '@/features/restaurantList/components/RestaurantFilterBar'
import { RestaurantSortChipGroup } from '@/features/restaurantList/components/RestaurantSortChipGroup'
import { CATEGORY_OPTIONS } from '@/features/restaurantList/constants'
import { useRestaurantListContent } from '@/features/restaurantList/hooks/useRestaurantListContent'
import type {
  FilterOption,
  RestaurantListCurationType,
} from '@/features/restaurantList/types'
import { FilterBottomSheet } from '@/shared/components/filterBottomSheet'
import { ListEmptyState } from '@/shared/components/listEmptyState'

type RestaurantListTemplateProps = {
  filterMode?: 'bottom-sheet' | 'inline-sort'
  title: string
  restaurantType: RestaurantListCurationType
  sortOptions: FilterOption[]
}

const renderSkeletonItems = (count: number) => {
  return Array.from({ length: count }, (_, index) => (
    <li
      aria-hidden="true"
      className="border-warm-gray-50 w-full border-b py-4 last:border-b-0"
      data-testid="restaurant-list-skeleton-item"
      key={index}
    >
      <div className="flex flex-col">
        <div className="bg-secondary-200 h-5 w-40 animate-pulse rounded" />
        <div className="bg-secondary-200 mt-0.5 h-6 w-28 animate-pulse rounded" />
        <div className="mt-2 flex gap-2 overflow-hidden">
          {Array.from({ length: 3 }, (_, imageIndex) => (
            <div
              className="bg-secondary-200 size-33.75 shrink-0 animate-pulse rounded-[5px]"
              key={imageIndex}
            />
          ))}
        </div>
        <div className="bg-secondary-200 mt-3 h-5.5 w-full animate-pulse rounded" />
        <div className="bg-secondary-200 mt-2 h-4 w-3/4 animate-pulse rounded" />
      </div>
    </li>
  ))
}

export const RestaurantListTemplate = ({
  filterMode = 'bottom-sheet',
  title,
  restaurantType,
  sortOptions,
}: RestaurantListTemplateProps) => {
  const {
    activeBottomSheet,
    categoryLabel,
    draftCategory,
    draftSort,
    hasInitialLoadError,
    hasMoreRestaurants,
    hasNextPageError,
    isFetchingNextPage,
    isLoading,
    loadMoreRef,
    selectedSort,
    visibleRestaurants,
    handleApplyCategory,
    handleApplySort,
    handleBackClick,
    handleClickRestaurant,
    handleChangeSort,
    handleCloseBottomSheet,
    handleOpenCategorySheet,
    handleOpenSortSheet,
    handleResetCategory,
    handleResetSort,
    handleRetry,
    handleRetryNextPage,
    handleSelectCategory,
    handleSelectSort,
  } = useRestaurantListContent({
    restaurantType,
    sortOptions,
  })
  const shouldRenderEmptyState =
    visibleRestaurants.length === 0 &&
    !hasMoreRestaurants &&
    !isFetchingNextPage
  const shouldRenderList =
    visibleRestaurants.length > 0 || hasMoreRestaurants || isFetchingNextPage

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <div
        className="app-mobile-fixed-top z-fixed bg-white"
        data-testid="restaurant-list-sticky-header"
      >
        <Header
          className="text-primary-200"
          elevated={restaurantType !== 'sns-hot'}
          leftAction={
            <IconButton
              aria-label="뒤로가기"
              onClick={handleBackClick}
              size="xs"
            >
              <BackIcon className="size-6" />
            </IconButton>
          }
          title={<h1>{title}</h1>}
        />
      </div>

      <div
        className="flex flex-1 flex-col pt-[75px]"
        data-testid="restaurant-list-scroll-content"
      >
        <div className="sticky top-[75px] z-10 bg-white">
          {filterMode === 'inline-sort' ? (
            <RestaurantSortChipGroup
              onValueChange={handleChangeSort}
              options={sortOptions}
              selectedValue={selectedSort.value}
            />
          ) : (
            <RestaurantFilterBar
              categoryLabel={categoryLabel}
              onClickCategory={handleOpenCategorySheet}
              onClickSort={handleOpenSortSheet}
              sortLabel={selectedSort.label}
            />
          )}
        </div>

        {isLoading ? (
          <ul
            aria-label={`${title} 식당 목록 로딩 중`}
            className="mx-auto flex w-full flex-col gap-2 px-5"
            data-testid="restaurant-list"
          >
            {renderSkeletonItems(3)}
          </ul>
        ) : hasInitialLoadError ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 px-5 text-center">
            <p className="typo-body-4 text-primary-200">
              식당 목록을 불러오지 못했습니다.
            </p>
            <Button onClick={handleRetry} size="sm" variant="neutral">
              다시 시도
            </Button>
          </div>
        ) : (
          <>
            {shouldRenderList ? (
              <ul
                className="mx-auto flex w-full flex-col gap-2 px-5"
                data-testid="restaurant-list"
              >
                {visibleRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    onClick={handleClickRestaurant}
                    restaurant={restaurant}
                  />
                ))}
                {hasMoreRestaurants && !hasNextPageError ? (
                  <li
                    aria-hidden="true"
                    className="h-px"
                    data-testid="restaurant-list-load-more"
                    ref={loadMoreRef}
                  />
                ) : null}
                {isFetchingNextPage ? renderSkeletonItems(1) : null}
                {hasNextPageError ? (
                  <li className="flex flex-col items-center gap-3 py-6 text-center">
                    <p className="typo-body-4 text-primary-200">
                      식당을 더 불러오지 못했습니다.
                    </p>
                    <Button
                      onClick={handleRetryNextPage}
                      size="sm"
                      variant="neutral"
                    >
                      다시 시도
                    </Button>
                  </li>
                ) : null}
              </ul>
            ) : null}
            {shouldRenderEmptyState ? (
              <div className="flex flex-1 items-center justify-center px-5">
                <ListEmptyState description="검색된 식당이 없습니다." />
              </div>
            ) : null}
          </>
        )}
      </div>

      {filterMode === 'bottom-sheet' ? (
        <>
          <FilterBottomSheet
            onApply={handleApplySort}
            onOpenChange={handleCloseBottomSheet}
            onReset={handleResetSort}
            onSelect={handleSelectSort}
            open={activeBottomSheet === 'sort'}
            options={sortOptions}
            selectedValue={draftSort.value}
            title="정렬 순서"
          />
          <FilterBottomSheet
            onApply={handleApplyCategory}
            onOpenChange={handleCloseBottomSheet}
            onReset={handleResetCategory}
            onSelect={handleSelectCategory}
            open={activeBottomSheet === 'category'}
            options={CATEGORY_OPTIONS}
            selectedValue={draftCategory.value}
            title="음식 장르 선택"
          />
        </>
      ) : null}
    </div>
  )
}
