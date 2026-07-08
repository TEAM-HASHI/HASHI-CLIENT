import { BackIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'

import {
  CATEGORY_OPTIONS,
  RestaurantCard,
  RestaurantFilterBar,
  useRestaurantListPage,
} from '@/features/restaurantList'
import type { FilterOption, Restaurant } from '@/features/restaurantList'
import { FilterBottomSheet } from '@/shared/components/filterBottomSheet'

type RestaurantListPageProps = {
  title: string
  restaurants: Restaurant[]
  sortOptions: FilterOption[]
}

export const RestaurantListPage = ({
  title,
  restaurants,
  sortOptions,
}: RestaurantListPageProps) => {
  const {
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
  } = useRestaurantListPage({
    restaurants,
    sortOptions,
  })

  return (
    <div className="min-h-dvh bg-white">
      <div className="z-fixed sticky top-0 bg-white">
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
        <RestaurantFilterBar
          categoryLabel={categoryLabel}
          onClickCategory={handleOpenCategorySheet}
          onClickSort={handleOpenSortSheet}
          sortLabel={selectedSort.label}
        />
      </div>

      <ul className="mx-auto flex w-full flex-col gap-1 px-5">
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
      </ul>

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
