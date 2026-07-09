import {
  BackIcon,
  ClockSmallIcon,
  CopyIcon,
  LocationIcon,
  MoneySmallIcon,
  StarFillIcon,
} from '@hashi/hds-icons'
import { Header, IconButton, showToast } from '@hashi/hds-ui'
import { useCallback } from 'react'

import { RestaurantBottomBar } from '@/features/restaurantDetail/components/RestaurantBottomBar'
import { RestaurantDetailHero } from '@/features/restaurantDetail/components/RestaurantDetailHero'
import { RestaurantDetailTabs } from '@/features/restaurantDetail/components/RestaurantDetailTabs'
import { RestaurantInfoSection } from '@/features/restaurantDetail/components/RestaurantInfoSection'
import { RestaurantMenuSection } from '@/features/restaurantDetail/components/RestaurantMenuSection'
import { RestaurantReviewSection } from '@/features/restaurantDetail/components/RestaurantReviewSection'
import { ReviewImageViewer } from '@/features/restaurantDetail/components/ReviewImageViewer'
import { ReviewUnavailableModal } from '@/features/restaurantDetail/components/ReviewUnavailableModal'
import {
  RESTAURANT_DETAIL_HEADER_HEIGHT,
  RESTAURANT_DETAIL_TAB_BAR_HEIGHT,
} from '@/features/restaurantDetail/constants/restaurantDetailLayout'
import { useRestaurantDetailTabBarFixed } from '@/features/restaurantDetail/hooks/useRestaurantDetailTabBarFixed'
import type {
  RestaurantDetail,
  RestaurantDetailTab,
  RestaurantDetailVariant,
} from '@/features/restaurantDetail/types/restaurantDetail'
import { ShareIconButton } from '@/shared/components/shareIconButton'
import { cn, copyTextToClipboard } from '@/shared/utils'

interface RestaurantDetailTemplateProps {
  activeTab: RestaurantDetailTab
  reviewImageViewerImageUrls: string[]
  reviewImageViewerInitialIndex: number
  isReviewImageViewerOpen: boolean
  isReviewUnavailableModalOpen: boolean
  restaurant: RestaurantDetail
  shareUrl?: string
  title: string
  variant: RestaurantDetailVariant
  onPressBack: () => void
  onPressLike: () => void
  onPressMenuItem: (menuId: string) => void
  onPressRecommendAgain?: () => void
  onPressReservation: () => void
  onPressReviewImage: (reviewId: string, imageIndex: number) => void
  onPressWriteReview: () => void
  onTabChange: (tab: RestaurantDetailTab) => void
  onCloseReviewImageViewer: () => void
  onCloseReviewUnavailableModal: () => void
}

export const RestaurantDetailTemplate = ({
  activeTab,
  reviewImageViewerImageUrls,
  reviewImageViewerInitialIndex,
  isReviewImageViewerOpen,
  isReviewUnavailableModalOpen,
  restaurant,
  shareUrl,
  title,
  variant,
  onPressBack,
  onPressLike,
  onPressMenuItem,
  onPressRecommendAgain,
  onPressReservation,
  onPressReviewImage,
  onPressWriteReview,
  onTabChange,
  onCloseReviewImageViewer,
  onCloseReviewUnavailableModal,
}: RestaurantDetailTemplateProps) => {
  const { isTabBarFixed, markerRef } = useRestaurantDetailTabBarFixed()

  const scrollToTabBarTop = useCallback(() => {
    const marker = markerRef.current

    if (!marker) {
      return
    }

    const nextScrollTop =
      marker.getBoundingClientRect().top +
      window.scrollY -
      RESTAURANT_DETAIL_HEADER_HEIGHT

    window.scrollTo({ top: nextScrollTop })
  }, [markerRef])

  const handleTabChange = (tab: RestaurantDetailTab) => {
    onTabChange(tab)

    if (tab !== 'info') {
      requestAnimationFrame(scrollToTabBarTop)
    }
  }

  const handlePressCopyRestaurantName = () => {
    void copyTextToClipboard(restaurant.name)
    showToast({ children: '식당명이 복사 되었어요.' })
  }

  return (
    <main className="min-h-dvh bg-white pb-[calc(82px+var(--safe-area-bottom,0px))]">
      <h1 className="sr-only">{title}</h1>
      <div
        className="z-fixed fixed inset-x-0 top-0 mx-auto w-full max-w-[var(--app-mobile-max-width,100%)]"
        data-testid="restaurant-detail-fixed-header"
      >
        <Header
          leftAction={
            <IconButton aria-label="뒤로가기" onClick={onPressBack} size="xs">
              <BackIcon className="size-6" />
            </IconButton>
          }
          rightAction={<ShareIconButton shareUrl={shareUrl} />}
          title={title}
        />
      </div>
      <div
        aria-hidden="true"
        style={{ height: RESTAURANT_DETAIL_HEADER_HEIGHT }}
      />

      <RestaurantDetailHero imageUrls={restaurant.heroImages} />

      <section className="px-5 py-6">
        <div className="flex items-start gap-1">
          <div className="min-w-0 flex-1">
            <h2 className="typo-header-2 text-primary-200 line-clamp-2 break-keep">
              {restaurant.name}
            </h2>
            <p className="typo-body-3 text-primary-200 mt-1">
              {restaurant.localName}
            </p>
          </div>
          <IconButton
            aria-label="식당명 복사"
            className="text-warm-gray-300 mt-1"
            onClick={handlePressCopyRestaurantName}
            size="xs"
          >
            <CopyIcon className="size-6" />
          </IconButton>
        </div>

        <div className="mt-2 flex items-center gap-0.5">
          <StarFillIcon
            aria-hidden="true"
            className="text-primary-400 size-[18px] shrink-0"
          />
          <span className="typo-body-4 text-primary-200">
            {restaurant.rating.toFixed(1)}
          </span>
        </div>
        <p className="typo-body-7 text-cool-gray-600 mt-1 break-keep">
          {restaurant.summary}
        </p>

        <dl className="typo-body-7 text-primary-200 mt-5 flex flex-col gap-1.5">
          <div className="flex items-start gap-2">
            <dt className="sr-only">주소</dt>
            <LocationIcon
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
            />
            <dd>{restaurant.address}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="sr-only">영업시간</dt>
            <ClockSmallIcon aria-hidden="true" className="size-4 shrink-0" />
            <dd>
              {restaurant.visitDateLabel} {restaurant.openTime} ~{' '}
              {restaurant.closeTime}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="sr-only">예약금</dt>
            <MoneySmallIcon aria-hidden="true" className="size-4 shrink-0" />
            <dd>예약금 {restaurant.deposit}</dd>
          </div>
        </dl>
      </section>

      <div aria-hidden="true" ref={markerRef} />
      <div
        className={cn(
          'z-fixed bg-white',
          isTabBarFixed
            ? 'fixed inset-x-0 mx-auto w-full max-w-[var(--app-mobile-max-width,100%)]'
            : 'relative',
        )}
        data-fixed={isTabBarFixed}
        data-testid="restaurant-detail-tab-sticky-container"
        style={
          isTabBarFixed ? { top: RESTAURANT_DETAIL_HEADER_HEIGHT } : undefined
        }
      >
        <RestaurantDetailTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          reviewCount={restaurant.reviewCount}
        />
      </div>
      {isTabBarFixed ? (
        <div
          aria-hidden="true"
          style={{ height: RESTAURANT_DETAIL_TAB_BAR_HEIGHT }}
        />
      ) : null}

      {activeTab === 'info' ? (
        <RestaurantInfoSection restaurant={restaurant} />
      ) : activeTab === 'menu' ? (
        <RestaurantMenuSection
          menus={restaurant.menus}
          onPressMenuItem={onPressMenuItem}
        />
      ) : (
        <RestaurantReviewSection
          onPressReviewImage={onPressReviewImage}
          onPressWriteReview={onPressWriteReview}
          rating={restaurant.rating}
          restaurantName={restaurant.name}
          reviewCount={restaurant.reviewCount}
          reviews={restaurant.reviews}
        />
      )}

      <ReviewImageViewer
        imageUrls={reviewImageViewerImageUrls}
        initialIndex={reviewImageViewerInitialIndex}
        onClose={onCloseReviewImageViewer}
        open={isReviewImageViewerOpen}
      />
      <ReviewUnavailableModal
        onClose={onCloseReviewUnavailableModal}
        open={isReviewUnavailableModalOpen}
      />
      <RestaurantBottomBar
        likeCount={restaurant.likeCount}
        onPressLike={onPressLike}
        onPressRecommendAgain={onPressRecommendAgain}
        onPressReservation={onPressReservation}
        variant={variant}
      />
    </main>
  )
}
