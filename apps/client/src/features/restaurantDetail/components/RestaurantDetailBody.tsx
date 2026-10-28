import type { CSSProperties, Ref } from 'react'

import { RestaurantDetailTabs } from '@/features/restaurantDetail/components/RestaurantDetailTabs'
import { RESTAURANT_DETAIL_TABS } from '@/features/restaurantDetail/constants/restaurantDetailTabs'
import {
  RESTAURANT_DETAIL_HEADER_HEIGHT,
  RESTAURANT_DETAIL_TAB_BAR_HEIGHT,
} from '@/features/restaurantDetail/constants/restaurantDetailLayout'
import { RestaurantInfoSection } from '@/features/restaurantDetail/components/RestaurantInfoSection'
import { RestaurantMenuListSection } from '@/features/restaurantDetail/components/RestaurantMenuListSection'
import { RestaurantPhotoSection } from '@/features/restaurantDetail/components/RestaurantPhotoSection'
import { RestaurantReviewSection } from '@/features/restaurantDetail/components/RestaurantReviewSection'
import type { useRestaurantDetailContent } from '@/features/restaurantDetail/hooks/useRestaurantDetailContent'
import type { useRestaurantPhotos } from '@/features/restaurantDetail/hooks/useRestaurantPhotos'
import type { RestaurantDetail } from '@/features/restaurantDetail/types/restaurantDetail'
import { cn } from '@/shared/utils'

type TabContent = Pick<
  ReturnType<typeof useRestaurantDetailContent>,
  | 'activeTab'
  | 'hasMoreMenus'
  | 'hasMoreReviews'
  | 'isMenuListError'
  | 'isMenuListLoading'
  | 'isMenuNextPageError'
  | 'isReviewNextPageError'
  | 'isReviewListError'
  | 'isReviewListLoading'
  | 'menuLoadMoreRef'
  | 'reviewLoadMoreRef'
  | 'selectedReviewSort'
  | 'onPressReviewImage'
  | 'onRetryMenuList'
  | 'onRetryReviewList'
  | 'onSelectReviewSort'
  | 'onTabChange'
> & { restaurant: RestaurantDetail }

interface RestaurantDetailBodyProps {
  content: TabContent
  photos: ReturnType<typeof useRestaurantPhotos>
  onPressMenuItem: (id: string) => void
  onPressWriteReview: () => void
  onResetPhotoScroll: () => void
  isInfoLoading?: boolean
  tabBarPosition: 'relative' | 'fixed' | 'sticky'
  headerHeight?: number
  markerRef?: Ref<HTMLDivElement>
  panelRef?: Ref<HTMLDivElement>
}

export const RestaurantDetailBody = ({
  content,
  photos,
  onPressMenuItem,
  onPressWriteReview,
  onResetPhotoScroll,
  isInfoLoading = false,
  tabBarPosition,
  headerHeight = RESTAURANT_DETAIL_HEADER_HEIGHT,
  markerRef,
  panelRef,
}: RestaurantDetailBodyProps) => {
  const { restaurant, activeTab } = content
  const sectionStyle: CSSProperties = {
    scrollMarginTop: headerHeight + RESTAURANT_DETAIL_TAB_BAR_HEIGHT,
    ...(activeTab !== 'info' && {
      minHeight: `calc(100dvh - ${headerHeight + RESTAURANT_DETAIL_TAB_BAR_HEIGHT}px)`,
    }),
  }
  const section =
    activeTab === 'info' ? (
      isInfoLoading ? (
        <p role="status" className="px-5 py-9 text-center">
          매장 정보를 불러오고 있어요.
        </p>
      ) : (
        <RestaurantInfoSection restaurant={restaurant} showLocationMap />
      )
    ) : activeTab === 'menu' ? (
      <RestaurantMenuListSection
        menus={restaurant.menus}
        hasMoreMenus={content.hasMoreMenus}
        isMenuListError={content.isMenuListError}
        isLoading={content.isMenuListLoading}
        isNextPageError={content.isMenuNextPageError}
        loadMoreRef={content.menuLoadMoreRef}
        onPressMenuItem={onPressMenuItem}
        onRetryMenuList={content.onRetryMenuList}
      />
    ) : activeTab === 'photo' ? (
      <RestaurantPhotoSection
        key={restaurant.id}
        model={photos}
        onResetScroll={onResetPhotoScroll}
      />
    ) : (
      <RestaurantReviewSection
        restaurantName={restaurant.name}
        rating={restaurant.rating}
        reviewCount={restaurant.reviewCount}
        ratingDistribution={restaurant.ratingDistribution}
        reviews={restaurant.reviews}
        hasMoreReviews={content.hasMoreReviews}
        isReviewListError={content.isReviewListError}
        isNextPageError={content.isReviewNextPageError}
        isReviewListLoading={content.isReviewListLoading}
        loadMoreRef={content.reviewLoadMoreRef}
        selectedSort={content.selectedReviewSort}
        onPressReviewImage={content.onPressReviewImage}
        onPressWriteReview={onPressWriteReview}
        onRetryReviewList={content.onRetryReviewList}
        onSelectSort={content.onSelectReviewSort}
      />
    )
  return (
    <>
      <div aria-hidden="true" ref={markerRef} />
      <div
        className={cn(
          'z-fixed bg-white',
          tabBarPosition === 'fixed'
            ? 'fixed inset-x-0 mx-auto w-full max-w-[var(--app-mobile-max-width,100%)]'
            : tabBarPosition,
        )}
        style={
          tabBarPosition === 'relative' ? undefined : { top: headerHeight }
        }
        data-fixed={tabBarPosition === 'fixed'}
        data-page-scroll-top={tabBarPosition === 'fixed' ? '' : undefined}
        data-testid="restaurant-detail-tab-sticky-container"
      >
        <RestaurantDetailTabs
          activeTab={activeTab}
          onTabChange={content.onTabChange}
          reviewCount={restaurant.reviewCount}
          photoCount={photos.enabled ? photos.counts?.all : undefined}
        />
      </div>
      {tabBarPosition === 'fixed' && (
        <div
          aria-hidden="true"
          style={{ height: RESTAURANT_DETAIL_TAB_BAR_HEIGHT }}
        />
      )}
      <div
        ref={panelRef}
        role="tabpanel"
        aria-label={
          RESTAURANT_DETAIL_TABS.find(({ value }) => value === activeTab)?.label
        }
        style={sectionStyle}
      >
        {section}
      </div>
    </>
  )
}
