import { CancelIcon, SaveBlankIcon, SaveIcon } from '@hashi/hds-icons'
import { Button, Dialog, DragPanel, IconButton, Tabs } from '@hashi/hds-ui'
import { useLayoutEffect, useRef, useState } from 'react'

import { RestaurantInfoSection } from '@/features/restaurantDetail/components/RestaurantInfoSection'
import { RestaurantMenuListSection } from '@/features/restaurantDetail/components/RestaurantMenuListSection'
import { RestaurantPhotoSection } from '@/features/restaurantDetail/components/RestaurantPhotoSection'
import { RestaurantReviewSection } from '@/features/restaurantDetail/components/RestaurantReviewSection'
import type { RestaurantDetailTab } from '@/features/restaurantDetail/types/restaurantDetail'
import { MapPhotoViewer } from '@/pages/map/components/MapPhotoViewer'
import { MapRestaurantImages } from '@/pages/map/components/MapRestaurantImages'
import { MapRestaurantMeta } from '@/pages/map/components/MapRestaurantMeta'
import { MapSaveAction } from '@/pages/map/components/MapSaveAction'
import { MapStatusView } from '@/pages/map/components/MapStatusView'
import { useMapPanelLayout } from '@/pages/map/hooks/useMapPanelLayout'
import { useMapRestaurantDetail } from '@/pages/map/hooks/useMapRestaurantDetail'
import type { MapPanelStage, MapRestaurant } from '@/pages/map/types'
import { cn } from '@/shared/utils'

interface MapRestaurantDetailProps {
  restaurant: MapRestaurant
  stage: MapPanelStage
  onStageChange: (stage: MapPanelStage) => void
  onClose: () => void
  onPhotoSelect?: (index: number) => void
  onUnavailable: () => void
  onSave?: () => void
  onLoadError?: () => void
  onPressMenuItem: (menuId: string) => void
  initialTab?: RestaurantDetailTab
  onTabChange?: (tab: RestaurantDetailTab) => void
}

const TABS: { value: RestaurantDetailTab; label: string }[] = [
  { value: 'info', label: '매장 정보' },
  { value: 'menu', label: '메뉴' },
  { value: 'photo', label: '사진' },
  { value: 'review', label: '리뷰' },
]

export const MapRestaurantDetail = (props: MapRestaurantDetailProps) => (
  <SelectedRestaurantDetail key={props.restaurant.id} {...props} />
)

const SelectedRestaurantDetail = (props: MapRestaurantDetailProps) => {
  const [photoViewer, setPhotoViewer] = useState<{
    images: string[]
    index: number
  } | null>(null)
  const model = useMapRestaurantDetail(props)
  const summaryRef = useRef<HTMLDivElement>(null)
  const previousStage = useRef(props.stage)
  useLayoutEffect(() => {
    const returningToSummary =
      previousStage.current === 'expanded' && props.stage !== 'expanded'
    previousStage.current = props.stage
    if (!returningToSummary) return
    // Wait for the modal's background isolation and focus restoration to finish.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() =>
        summaryRef.current?.focus({ preventScroll: true }),
      )
    })
    return () => cancelAnimationFrame(frame)
  }, [props.stage])
  const panel = (
    <MapDetailPanel
      {...props}
      restaurant={model.displayRestaurant}
      model={model}
      activeTab={model.activeTab}
      onTabChange={model.onTabChange}
      onPhotoSelect={(index) =>
        setPhotoViewer({ images: model.displayRestaurant.images, index })
      }
      onReviewPhotoSelect={(reviewId, index) => {
        const images = model.detail?.reviews.find(
          ({ id }) => id === reviewId,
        )?.images
        if (images?.length) setPhotoViewer({ images, index })
      }}
    />
  )
  const viewer = photoViewer && (
    <MapPhotoViewer
      images={photoViewer.images}
      initialIndex={photoViewer.index}
      onClose={() => setPhotoViewer(null)}
    />
  )

  if (props.stage !== 'expanded')
    return (
      <>
        <div
          ref={summaryRef}
          role="region"
          aria-label="선택한 식당 요약"
          tabIndex={-1}
          className="pointer-events-none absolute inset-0"
        >
          {panel}
        </div>
        {viewer}
      </>
    )

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) props.onStageChange('normal')
      }}
    >
      <Dialog.Content
        aria-label={`${model.displayRestaurant.name} 전체 상세`}
        className="fixed inset-0 mx-auto h-dvh w-full max-w-[var(--app-mobile-max-width,430px)] rounded-none p-0 pt-[var(--safe-area-top,0px)]"
      >
        {panel}
        {viewer}
      </Dialog.Content>
    </Dialog.Root>
  )
}

const MapDetailPanel = ({
  restaurant,
  stage,
  onStageChange,
  onClose,
  onPhotoSelect,
  onUnavailable,
  onSave = onUnavailable,
  onPressMenuItem,
  activeTab,
  onTabChange,
  onReviewPhotoSelect,
  model,
}: MapRestaurantDetailProps & {
  activeTab: RestaurantDetailTab
  onTabChange: (tab: RestaurantDetailTab) => void
  onPhotoSelect: (index: number) => void
  onReviewPhotoSelect: (reviewId: string, index: number) => void
  model: ReturnType<typeof useMapRestaurantDetail>
}) => {
  const { containerRef, availableHeight } = useMapPanelLayout()
  const tabPanelRef = useRef<HTMLDivElement>(null)
  const isExpanded = stage === 'expanded'
  const maximum = Math.max(30, availableHeight)
  const normal = Math.min(294, maximum)
  const height = isExpanded ? maximum : stage === 'collapsed' ? 30 : normal

  return (
    <section
      ref={containerRef}
      aria-label={`${restaurant.name} 상세 패널`}
      className={cn(
        'pointer-events-none',
        isExpanded ? 'relative h-full w-full' : 'absolute inset-0',
      )}
    >
      <DragPanel
        aria-label="선택한 식당"
        handleLabel="식당 상세 높이 조절"
        height={height}
        normalHeight={normal}
        maxHeight={maximum}
        onHeightChange={(next) =>
          onStageChange(
            next <= 30 ? 'collapsed' : next >= maximum ? 'expanded' : 'normal',
          )
        }
        footer={
          isExpanded && !model.isSummaryLoading ? (
            <div className="flex items-center gap-4 bg-white px-5 pt-4 pb-[calc(24px+var(--safe-area-bottom,0px))]">
              <IconButton
                aria-label={`${restaurant.name} 저장`}
                aria-pressed={restaurant.saved ?? false}
                onClick={onSave}
                className="text-warm-gray-100"
              >
                {restaurant.saved ? (
                  <SaveIcon className="text-primary-200 size-6" />
                ) : (
                  <SaveBlankIcon className="size-6" />
                )}
              </IconButton>
              <Button width="full" onClick={onUnavailable}>
                예약하기
              </Button>
            </div>
          ) : undefined
        }
      >
        <div className="relative min-h-full">
          {model.isSummaryLoading ? (
            <div className="absolute inset-0 flex items-center justify-center pt-6">
              <MapStatusView loading message="식당 정보를 불러오고 있어요." />
            </div>
          ) : (
            <>
              {isExpanded ? (
                <header className="sticky top-0 z-20 flex h-12.5 items-center gap-2 bg-white px-5">
                  <h2
                    className="typo-header-2 text-primary-200 min-w-0 flex-1 truncate"
                    title={restaurant.name}
                  >
                    {restaurant.name}
                  </h2>
                  <IconButton
                    aria-label="식당 상세 닫기"
                    size="xs"
                    onClick={onClose}
                  >
                    <CancelIcon className="size-6" />
                  </IconButton>
                </header>
              ) : null}
              <div className={cn('px-5 pb-6', !isExpanded && 'pt-2.75')}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {!isExpanded && (
                      <h2
                        className="typo-header-2 text-primary-200 mb-2 truncate"
                        title={restaurant.name}
                      >
                        {restaurant.name}
                      </h2>
                    )}
                    {model.hasLoadError ? (
                      <div role="alert" className="py-4">
                        <p className="typo-body-7">
                          식당 정보를 불러오지 못했어요.
                        </p>
                        <Button size="sm" onClick={() => void model.onRetry()}>
                          다시 시도
                        </Button>
                      </div>
                    ) : (
                      <MapRestaurantMeta restaurant={restaurant} />
                    )}
                  </div>
                  {!isExpanded && (
                    <MapSaveAction restaurant={restaurant} onSave={onSave} />
                  )}
                </div>
                {!model.hasLoadError && (
                  <div className="mt-3">
                    <MapRestaurantImages
                      restaurant={restaurant}
                      onPhotoSelect={onPhotoSelect}
                    />
                  </div>
                )}
              </div>
              {isExpanded && model.detail && !model.hasLoadError && (
                <>
                  <div className="sticky top-12.5 z-10 bg-white px-5">
                    <Tabs
                      aria-label="식당 상세 정보"
                      items={TABS.map((tab) => ({
                        ...tab,
                        count:
                          tab.value === 'review'
                            ? restaurant.reviewCount
                            : tab.value === 'photo'
                              ? model.photos.counts?.all
                              : undefined,
                      }))}
                      value={activeTab}
                      onChange={(value) => {
                        const tab = TABS.find((item) => item.value === value)
                        if (tab && tab.value !== activeTab) {
                          onTabChange(tab.value)
                          if (tab.value === 'review')
                            tabPanelRef.current?.scrollIntoView?.({
                              block: 'start',
                            })
                        }
                      }}
                    />
                  </div>
                  <div
                    ref={tabPanelRef}
                    role="tabpanel"
                    aria-label={
                      TABS.find(({ value }) => value === activeTab)?.label
                    }
                    className="min-h-80 scroll-mt-25"
                  >
                    {activeTab === 'info' &&
                      (model.isStoreInformationLoading ? (
                        <div className="flex min-h-68 items-center justify-center">
                          <MapStatusView
                            loading
                            message="매장 정보를 불러오고 있어요."
                          />
                        </div>
                      ) : (
                        <RestaurantInfoSection restaurant={model.detail} />
                      ))}
                    {activeTab === 'menu' && (
                      <RestaurantMenuListSection
                        menus={model.detail.menus}
                        hasMoreMenus={model.hasMoreMenus}
                        isMenuListError={model.isMenuListError}
                        isLoading={model.isMenuListPending}
                        isNextPageError={model.isMenuNextPageError}
                        loadMoreRef={model.menuLoadMoreRef}
                        onPressMenuItem={onPressMenuItem}
                        onRetryMenuList={model.onRetryMenuList}
                      />
                    )}
                    {activeTab === 'photo' && (
                      <RestaurantPhotoSection
                        model={model.photos}
                        onResetScroll={() =>
                          tabPanelRef.current?.scrollIntoView({
                            block: 'start',
                          })
                        }
                      />
                    )}
                    {activeTab === 'review' && (
                      <RestaurantReviewSection
                        rating={model.detail.rating}
                        restaurantName={restaurant.name}
                        reviewCount={model.detail.reviewCount}
                        ratingDistribution={model.detail.ratingDistribution}
                        reviews={model.detail.reviews}
                        hasMoreReviews={model.hasMoreReviews}
                        isReviewListError={model.isReviewListError}
                        isNextPageError={model.isReviewNextPageError}
                        isReviewListLoading={model.isReviewListLoading}
                        loadMoreRef={model.reviewLoadMoreRef}
                        selectedSort={model.selectedReviewSort}
                        onPressReviewImage={onReviewPhotoSelect}
                        onPressWriteReview={onUnavailable}
                        onRetryReviewList={model.onRetryReviewList}
                        onSelectSort={model.onSelectReviewSort}
                      />
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </DragPanel>
    </section>
  )
}
