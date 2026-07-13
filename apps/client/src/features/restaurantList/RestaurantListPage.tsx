import { BackIcon } from '@hashi/hds-icons'
import { Button, Header, IconButton } from '@hashi/hds-ui'

import {
  CATEGORY_OPTIONS,
  RestaurantCard,
  RestaurantFilterBar,
  useRestaurantListPage,
} from '@/features/restaurantList'
import type {
  FilterOption,
  RestaurantListCurationType,
} from '@/features/restaurantList'
import { FilterBottomSheet } from '@/shared/components/filterBottomSheet'

type RestaurantListPageProps = {
  title: string
  restaurantType: RestaurantListCurationType
  sortOptions: FilterOption[]
}

const renderSkeletonItems = (count: number) => {
  return Array.from({ length: count }, (_, index) => (
    <li
      aria-hidden="true"
      className="border-warm-gray-50 w-full border-b py-4.75 last:border-b-0"
      data-testid="restaurant-list-skeleton-item"
      key={index}
    >
      <div className="flex flex-col">
        <div className="bg-secondary-200 h-5 w-40 animate-pulse rounded" />
        <div className="bg-secondary-200 mt-2 h-5 w-28 animate-pulse rounded" />
        <div className="mt-2.75 flex gap-2">
          {Array.from({ length: 3 }, (_, imageIndex) => (
            <div
              className="bg-secondary-200 h-[143px] w-[143px] shrink-0 animate-pulse rounded-[5px]"
              key={imageIndex}
            />
          ))}
        </div>
        <div className="bg-secondary-200 mt-3 h-4 w-full animate-pulse rounded" />
        <div className="bg-secondary-200 mt-2 h-4 w-3/4 animate-pulse rounded" />
      </div>
    </li>
  ))
}

export const RestaurantListPage = ({
  title,
  restaurantType,
  sortOptions,
}: RestaurantListPageProps) => {
  const {
    activeBottomSheet,
    categoryLabel,
    draftCategory,
    draftSort,
    hasMoreRestaurants,
    isError,
    isFetchingNextPage,
    isLoading,
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
    handleRetry,
    handleSelectCategory,
    handleSelectSort,
  } = useRestaurantListPage({
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
    <div className="min-h-dvh bg-white">
      <div
        className="app-mobile-fixed-top z-fixed bg-white"
        data-testid="restaurant-list-sticky-header"
      >
        <Header
          className="text-primary-200"
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

      <div className="pt-[75px]" data-testid="restaurant-list-scroll-content">
        <RestaurantFilterBar
          categoryLabel={categoryLabel}
          onClickCategory={handleOpenCategorySheet}
          onClickSort={handleOpenSortSheet}
          sortLabel={selectedSort.label}
        />

        {isLoading ? (
          <ul
            aria-label={`${title} 식당 목록 로딩 중`}
            className="mx-auto flex w-full flex-col gap-1 px-5"
            data-testid="restaurant-list"
          >
            {renderSkeletonItems(3)}
          </ul>
        ) : isError ? (
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
                className="mx-auto flex w-full flex-col gap-1 px-5"
                data-testid="restaurant-list"
              >
                {visibleRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    onClick={handleClickRestaurant}
                    restaurant={restaurant}
                  />
                ))}
                {hasMoreRestaurants && (
                  <li
                    aria-hidden="true"
                    className="h-px"
                    data-testid="restaurant-list-load-more"
                    ref={loadMoreRef}
                  />
                )}
                {isFetchingNextPage ? renderSkeletonItems(1) : null}
              </ul>
            ) : null}
            {shouldRenderEmptyState ? (
              <div className="flex min-h-[360px] items-center justify-center px-5 text-center">
                <p className="typo-body-4 text-warm-gray-300">
                  표시할 식당이 없습니다.
                </p>
              </div>
            ) : null}
          </>
        )}
      </div>

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
    </div>
  )
}
