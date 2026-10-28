import { CancelIcon } from '@hashi/hds-icons'
import {
  Button,
  Dialog,
  DragPanel,
  DRAG_PANEL_HEIGHTS,
  IconButton,
} from '@hashi/hds-ui'
import { useLayoutEffect, useRef, useState } from 'react'

import { RestaurantDetailBody } from '@/features/restaurantDetail/components/RestaurantDetailBody'
import { RestaurantBottomBar } from '@/features/restaurantDetail/components/RestaurantBottomBar'
import { ReviewImageViewer } from '@/features/restaurantDetail/components/ReviewImageViewer'
import type { RestaurantDetailTab } from '@/features/restaurantDetail/types/restaurantDetail'
import type { ReviewSortValue } from '@/features/restaurantDetail/constants/restaurantReview'
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
  onPressReservation: () => void
  onPressWriteReview: () => void
  onSave: () => void
  onLoadError?: () => void
  onPressMenuItem: (menuId: string) => void
  initialTab?: RestaurantDetailTab
  onTabChange?: (tab: RestaurantDetailTab) => void
  initialScrollTop?: number
  onScrollTopChange?: (top: number) => void
  initialReviewSort?: ReviewSortValue
  onReviewSortChange?: (sort: ReviewSortValue) => void
}

export const MapRestaurantDetail = (props: MapRestaurantDetailProps) => (
  <SelectedRestaurantDetail key={props.restaurant.id} {...props} />
)

const SelectedRestaurantDetail = (props: MapRestaurantDetailProps) => {
  const [photoViewer, setPhotoViewer] = useState<{
    images: string[]
    index: number
    review?: boolean
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
        if (images?.length) setPhotoViewer({ images, index, review: true })
      }}
    />
  )
  const viewer =
    photoViewer &&
    (photoViewer.review ? (
      <ReviewImageViewer
        imageUrls={photoViewer.images}
        initialIndex={photoViewer.index}
        open
        onClose={() => setPhotoViewer(null)}
      />
    ) : (
      <MapPhotoViewer
        images={photoViewer.images}
        initialIndex={photoViewer.index}
        onClose={() => setPhotoViewer(null)}
      />
    ))

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
  onPressReservation,
  onPressWriteReview,
  onSave,
  onPressMenuItem,
  activeTab,
  onTabChange,
  onReviewPhotoSelect,
  model,
  initialScrollTop = 0,
  onScrollTopChange,
}: MapRestaurantDetailProps & {
  activeTab: RestaurantDetailTab
  onTabChange: (tab: RestaurantDetailTab) => void
  onPhotoSelect: (index: number) => void
  onReviewPhotoSelect: (reviewId: string, index: number) => void
  model: ReturnType<typeof useMapRestaurantDetail>
}) => {
  const { containerRef, availableHeight } = useMapPanelLayout()
  const tabPanelRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const restoredScroll = useRef(false)
  const isExpanded = stage === 'expanded'
  const contentPending =
    model.isSummaryLoading ||
    (activeTab === 'info' && model.isStoreInformationLoading) ||
    (activeTab === 'menu' && model.isMenuListLoading) ||
    (activeTab === 'review' && model.isReviewListLoading) ||
    (activeTab === 'photo' && model.photos.query.isPending)
  useLayoutEffect(() => {
    if (!isExpanded || contentPending || restoredScroll.current) return
    const scrollRoot = contentRef.current?.parentElement
    if (!scrollRoot) return
    scrollRoot.scrollTop = initialScrollTop
    restoredScroll.current = true
  }, [isExpanded, contentPending, initialScrollTop])
  const maximum = Math.max(30, availableHeight)
  const normal = Math.min(DRAG_PANEL_HEIGHTS.normal, maximum)
  const height = isExpanded ? maximum : stage === 'collapsed' ? 30 : normal

  return (
    <section
      ref={containerRef}
      aria-label={`${restaurant.name} 상세 패널`}
      onScrollCapture={(event) => {
        if (event.target === contentRef.current?.parentElement && isExpanded)
          onScrollTopChange?.((event.target as HTMLElement).scrollTop)
      }}
      className={cn(
        'pointer-events-none',
        isExpanded ? 'relative h-full w-full' : 'absolute inset-0',
      )}
    >
      <DragPanel
        className="[&_.overflow-y-auto]:scrollbar-hidden"
        aria-label="선택한 식당"
        handleLabel="식당 상세 높이 조절"
        height={height}
        stage={isExpanded ? 'maximum' : stage}
        maxHeight="fullscreen"
        onStageCommit={({ stage }) =>
          onStageChange(stage === 'maximum' ? 'expanded' : stage)
        }
        footer={
          isExpanded && !model.isSummaryLoading ? (
            <div className="min-h-[calc(var(--app-mobile-bottom-action-compact-height)+var(--safe-area-bottom,0px))]">
              <RestaurantBottomBar
                variant="detail"
                saved={restaurant.saved}
                likeCount={restaurant.saveCount?.toLocaleString('ko-KR') ?? ''}
                onPressLike={onSave}
                onPressReservation={onPressReservation}
              />
            </div>
          ) : undefined
        }
      >
        <div ref={contentRef} className="relative min-h-full">
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
                <RestaurantDetailBody
                  content={{
                    ...model,
                    restaurant: model.detail,
                    onPressReviewImage: onReviewPhotoSelect,
                    onTabChange: (tab) => {
                      if (tab === activeTab) return
                      onTabChange(tab)
                      if (tab === 'info') {
                        const root = contentRef.current?.parentElement
                        root?.scrollTo({ top: 0, behavior: 'instant' })
                      } else
                        tabPanelRef.current?.scrollIntoView?.({
                          block: 'start',
                        })
                    },
                  }}
                  photos={model.photos}
                  onPressMenuItem={onPressMenuItem}
                  onPressWriteReview={onPressWriteReview}
                  onResetPhotoScroll={() =>
                    tabPanelRef.current?.scrollIntoView({ block: 'start' })
                  }
                  isInfoLoading={model.isStoreInformationLoading}
                  tabBarPosition="sticky"
                  headerHeight={50}
                  panelRef={tabPanelRef}
                />
              )}
            </>
          )}
        </div>
      </DragPanel>
    </section>
  )
}
