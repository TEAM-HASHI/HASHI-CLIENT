import { useState } from 'react'
import { BackIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'
import { generatePath, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import {
  CATEGORY_OPTIONS,
  DEFAULT_CATEGORY_OPTION,
  MOCK_RESTAURANTS,
  POPULAR_RESTAURANTS_SORT_OPTIONS,
  RESTAURANT_LIST_PAGE_SIZE,
  RestaurantCard,
  RestaurantFilterBar,
  useInfiniteRestaurantList,
} from '@/features/restaurantList'
import type { FilterOption } from '@/features/restaurantList'
import { FilterBottomSheet } from '@/shared/components/filterBottomSheet'

type ActiveBottomSheet = 'sort' | 'category' | null

const getOptionByValue = (options: FilterOption[], value: string) => {
  return options.find((option) => option.value === value)
}

export const PopularRestaurantsPage = () => {
  const navigate = useNavigate()
  const defaultSortOption = POPULAR_RESTAURANTS_SORT_OPTIONS[0]
  const [activeBottomSheet, setActiveBottomSheet] =
    useState<ActiveBottomSheet>(null)
  const [selectedSort, setSelectedSort] = useState(defaultSortOption)
  const [draftSort, setDraftSort] = useState(defaultSortOption)
  const [selectedCategory, setSelectedCategory] = useState(
    DEFAULT_CATEGORY_OPTION,
  )
  const [draftCategory, setDraftCategory] = useState(DEFAULT_CATEGORY_OPTION)
  const {
    hasMoreItems: hasMoreRestaurants,
    loadMoreRef,
    visibleItems: visibleRestaurants,
  } = useInfiniteRestaurantList({
    items: MOCK_RESTAURANTS,
    pageSize: RESTAURANT_LIST_PAGE_SIZE,
  })

  const categoryLabel =
    selectedCategory.value === DEFAULT_CATEGORY_OPTION.value
      ? '음식 장르 선택'
      : selectedCategory.label

  const handleBackClick = () => {
    navigate(-1)
  }

  const handleOpenSortSheet = () => {
    setDraftSort(selectedSort)
    setActiveBottomSheet('sort')
  }

  const handleOpenCategorySheet = () => {
    setDraftCategory(selectedCategory)
    setActiveBottomSheet('category')
  }

  const handleCloseBottomSheet = () => {
    setActiveBottomSheet(null)
  }

  const handleSelectSort = (value: string) => {
    const nextOption = getOptionByValue(POPULAR_RESTAURANTS_SORT_OPTIONS, value)

    if (nextOption) {
      setDraftSort(nextOption)
    }
  }

  const handleSelectCategory = (value: string) => {
    const nextOption = getOptionByValue(CATEGORY_OPTIONS, value)

    if (nextOption) {
      setDraftCategory(nextOption)
    }
  }

  const handleResetSort = () => {
    setDraftSort(defaultSortOption)
  }

  const handleResetCategory = () => {
    setDraftCategory(DEFAULT_CATEGORY_OPTION)
  }

  const handleApplySort = () => {
    setSelectedSort(draftSort)
    setActiveBottomSheet(null)
  }

  const handleApplyCategory = () => {
    setSelectedCategory(draftCategory)
    setActiveBottomSheet(null)
  }

  const handleClickRestaurant = (restaurantId: string) => {
    navigate(generatePath(ROUTES.restaurantDetail, { restaurantId }))
  }

  return (
    <div className="min-h-dvh bg-white">
      <div className="sticky top-0 z-10 bg-white">
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
          title={<h1>인기 맛집</h1>}
        />
        <RestaurantFilterBar
          categoryLabel={categoryLabel}
          onClickCategory={handleOpenCategorySheet}
          onClickSort={handleOpenSortSheet}
          sortLabel={selectedSort.label}
        />
      </div>

      <ul className="mx-auto flex w-full max-w-[393px] flex-col gap-1 px-5">
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
        options={POPULAR_RESTAURANTS_SORT_OPTIONS}
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
