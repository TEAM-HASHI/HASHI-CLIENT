import {
  BackIcon,
  ClockSmallIcon,
  CopyIcon,
  LocationIcon,
  MoneySmallIcon,
  ShareIcon,
  StarFillIcon,
} from '@hashi/hds-icons'
import { Header, IconButton, showToast, toastQueue } from '@hashi/hds-ui'
import { useCallback, useEffect, useRef } from 'react'

import { AuthGateBottomSheet } from '@/features/auth/components/authGateBottomSheet'
import { RestaurantBottomBar } from '@/features/restaurantDetail/components/RestaurantBottomBar'
import { RestaurantDetailHero } from '@/features/restaurantDetail/components/RestaurantDetailHero'
import { RestaurantDetailTabs } from '@/features/restaurantDetail/components/RestaurantDetailTabs'
import { RestaurantInfoSection } from '@/features/restaurantDetail/components/RestaurantInfoSection'
import { RestaurantMenuListSection } from '@/features/restaurantDetail/components/RestaurantMenuListSection'
import { RestaurantPhotoSection } from '@/features/restaurantDetail/components/RestaurantPhotoSection'
import { RestaurantReviewSection } from '@/features/restaurantDetail/components/RestaurantReviewSection'
import { ReviewImageViewer } from '@/features/restaurantDetail/components/ReviewImageViewer'
import { ReviewUnavailableModal } from '@/features/restaurantDetail/components/ReviewUnavailableModal'
import {
  RESTAURANT_DETAIL_HEADER_HEIGHT,
  RESTAURANT_DETAIL_TAB_BAR_HEIGHT,
} from '@/features/restaurantDetail/constants/restaurantDetailLayout'
import { useRestaurantDetailTabBarFixed } from '@/features/restaurantDetail/hooks/useRestaurantDetailTabBarFixed'
import type { useRestaurantDetailContent } from '@/features/restaurantDetail/hooks/useRestaurantDetailContent'
import type { useRestaurantDetailActions } from '@/features/restaurantDetail/hooks/useRestaurantDetailActions'
import { useRestaurantPhotos } from '@/features/restaurantDetail/hooks/useRestaurantPhotos'
import { useRestaurantSaveSummary } from '@/features/restaurantDetail/hooks/useRestaurantSaveSummary'
import type {
  RestaurantDetail,
  RestaurantDetailTab,
  RestaurantDetailVariant,
} from '@/features/restaurantDetail/types/restaurantDetail'
import { ComingSoonDialog } from '@/shared/components/comingSoonDialog'
import { useShareLink } from '@/shared/components/shareIconButton'
import { cn, copyTextToClipboard } from '@/shared/utils'

interface RestaurantDetailTemplateProps {
  content: ReturnType<typeof useRestaurantDetailContent> & {
    restaurant: RestaurantDetail
  }
  actions: ReturnType<typeof useRestaurantDetailActions>
  shareUrl?: string
  shouldScrollToInitialTab?: boolean
  title: string
  variant: RestaurantDetailVariant
  onPressBack: () => void
  onPressRecommendAgain?: () => void
}

export const RestaurantDetailTemplate = ({
  content,
  actions,
  shareUrl,
  shouldScrollToInitialTab = false,
  title,
  variant,
  onPressBack,
  onPressRecommendAgain,
}: RestaurantDetailTemplateProps) => {
  const {
    activeTab,
    reviewImageViewerImageUrls,
    reviewImageViewerInitialIndex,
    isReviewImageViewerOpen,
    isReviewUnavailableModalOpen,
    restaurant,
    hasMoreMenus,
    hasMoreReviews,
    isMenuListError,
    isMenuListLoading,
    isMenuNextPageError,
    isReviewNextPageError,
    isReviewListError,
    isReviewListLoading,
    menuLoadMoreRef,
    reviewLoadMoreRef,
    selectedReviewSort,
    onPressReviewImage,
    onRetryMenuList,
    onRetryReviewList,
    onSelectReviewSort,
    onTabChange,
    onCloseReviewImageViewer,
    onCloseReviewUnavailableModal,
  } = content
  const {
    onPressLike,
    onPressMenuItem,
    onPressReservation,
    onPressWriteReview,
  } = actions
  const { isTabBarFixed, markerRef } = useRestaurantDetailTabBarFixed()
  const hasScrolledToInitialTabRef = useRef(false)
  const handleShare = useShareLink(shareUrl)
  const saves = useRestaurantSaveSummary(
    Number(restaurant.id),
    restaurant.saveCount,
  )
  const photos = useRestaurantPhotos(
    Number(restaurant.id),
    activeTab === 'photo',
  )

  const scrollToTabBarTop = useCallback(() => {
    const marker = markerRef.current

    if (!marker) {
      return
    }

    const nextScrollTop =
      marker.getBoundingClientRect().top +
      window.scrollY -
      RESTAURANT_DETAIL_HEADER_HEIGHT

    window.scrollTo({ top: nextScrollTop, behavior: 'smooth' })
  }, [markerRef])

  const handleTabChange = (tab: RestaurantDetailTab) => {
    onTabChange(tab)

    if (tab === 'info') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    requestAnimationFrame(scrollToTabBarTop)
  }

  useEffect(() => {
    if (
      hasScrolledToInitialTabRef.current ||
      !shouldScrollToInitialTab ||
      activeTab === 'info'
    ) {
      return
    }

    hasScrolledToInitialTabRef.current = true
    requestAnimationFrame(scrollToTabBarTop)
  }, [activeTab, scrollToTabBarTop, shouldScrollToInitialTab])

  const handlePressCopyRestaurantName = async () => {
    const isCopied = await copyTextToClipboard(restaurant.name)

    if (!isCopied) {
      return
    }

    toastQueue.clear()
    showToast({
      icon: <CopyIcon className="size-6 text-white" />,
      children: '식당명이 복사되었어요',
    })
  }

  const activeTabSection =
    activeTab === 'info' ? (
      <RestaurantInfoSection restaurant={restaurant} />
    ) : activeTab === 'menu' ? (
      <RestaurantMenuListSection
        hasMoreMenus={hasMoreMenus}
        isMenuListError={isMenuListError}
        isLoading={isMenuListLoading}
        isNextPageError={isMenuNextPageError}
        loadMoreRef={menuLoadMoreRef}
        menus={restaurant.menus}
        onPressMenuItem={onPressMenuItem}
        onRetryMenuList={onRetryMenuList}
      />
    ) : activeTab === 'photo' ? (
      <RestaurantPhotoSection
        key={restaurant.id}
        model={photos}
        onResetScroll={scrollToTabBarTop}
      />
    ) : (
      <RestaurantReviewSection
        hasMoreReviews={hasMoreReviews}
        isReviewListError={isReviewListError}
        isNextPageError={isReviewNextPageError}
        isReviewListLoading={isReviewListLoading}
        loadMoreRef={reviewLoadMoreRef}
        onPressReviewImage={onPressReviewImage}
        onRetryReviewList={onRetryReviewList}
        onPressWriteReview={onPressWriteReview}
        onSelectSort={onSelectReviewSort}
        rating={restaurant.rating}
        ratingDistribution={restaurant.ratingDistribution}
        restaurantName={restaurant.name}
        reviewCount={restaurant.reviewCount}
        reviews={restaurant.reviews}
        selectedSort={selectedReviewSort}
      />
    )
  const activeTabSectionStyle =
    activeTab === 'info'
      ? undefined
      : {
          minHeight: `calc(100dvh - ${
            RESTAURANT_DETAIL_HEADER_HEIGHT + RESTAURANT_DETAIL_TAB_BAR_HEIGHT
          }px)`,
        }

  const headerTitle = activeTab === 'info' ? title : restaurant.name

  return (
    <main className="app-mobile-bottom-action-compact-content min-h-dvh bg-white">
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
          rightAction={{
            type: 'icon',
            icon: <ShareIcon className="size-6" />,
            ariaLabel: '공유하기',
            onClick: handleShare,
          }}
          title={headerTitle}
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
            <dd>{restaurant.businessHoursSummary}</dd>
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
          photoCount={photos.enabled ? photos.counts?.all : undefined}
        />
      </div>
      {isTabBarFixed ? (
        <div
          aria-hidden="true"
          style={{ height: RESTAURANT_DETAIL_TAB_BAR_HEIGHT }}
        />
      ) : null}

      <div style={activeTabSectionStyle}>{activeTabSection}</div>

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
        likeCount={
          saves.saveCount === undefined
            ? ''
            : saves.saveCount.toLocaleString('ko-KR')
        }
        saved={saves.saved}
        onPressLike={onPressLike}
        onPressRecommendAgain={onPressRecommendAgain}
        onPressReservation={onPressReservation}
        variant={variant}
      />
      <AuthGateBottomSheet
        onKakaoPress={actions.onPressKakao}
        onOpenChange={actions.onAuthGateOpenChange}
        open={actions.isAuthGateOpen}
      />
      <ComingSoonDialog
        onOpenChange={actions.onComingSoonOpenChange}
        open={actions.isComingSoonOpen}
      />
    </main>
  )
}
