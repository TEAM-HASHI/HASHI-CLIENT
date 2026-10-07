import { CancelIcon, SaveBlankIcon } from '@hashi/hds-icons'
import {
  Button,
  Dialog,
  DragPanel,
  IconButton,
  ImageFallback,
  Tabs,
} from '@hashi/hds-ui'
import { useLayoutEffect, useRef, useState } from 'react'

import { MapRestaurantImages } from '@/pages/map/components/MapRestaurantImages'
import { MapRestaurantMeta } from '@/pages/map/components/MapRestaurantMeta'
import { MapSaveAction } from '@/pages/map/components/MapSaveAction'
import { useMapPanelLayout } from '@/pages/map/hooks/useMapPanelLayout'
import type { MapPanelStage, MapRestaurant } from '@/pages/map/types'
import { cn } from '@/shared/utils'

interface MapRestaurantDetailProps {
  restaurant: MapRestaurant
  stage: MapPanelStage
  onStageChange: (stage: MapPanelStage) => void
  onClose: () => void
  onPhotoSelect: (index: number) => void
  onUnavailable: () => void
}

const TABS = [
  { value: 'info', label: '매장 정보' },
  { value: 'menu', label: '메뉴' },
  { value: 'photo', label: '사진' },
  { value: 'review', label: '리뷰' },
]

export const MapRestaurantDetail = ({ ...props }: MapRestaurantDetailProps) => {
  const [activeTab, setActiveTab] = useState('info')
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
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  )

  if (props.stage !== 'expanded')
    return (
      <div
        ref={summaryRef}
        role="region"
        aria-label="선택한 식당 요약"
        tabIndex={-1}
        className="pointer-events-none absolute inset-0"
      >
        {panel}
      </div>
    )

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) props.onStageChange('normal')
      }}
    >
      <Dialog.Content
        aria-label={`${props.restaurant.name} 전체 상세`}
        className="fixed inset-0 mx-auto h-dvh w-full max-w-[var(--app-mobile-max-width,430px)] rounded-none p-0 pt-[var(--safe-area-top,0px)]"
      >
        {panel}
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
  activeTab,
  onTabChange,
}: MapRestaurantDetailProps & {
  activeTab: string
  onTabChange: (tab: string) => void
}) => {
  const { containerRef, availableHeight } = useMapPanelLayout()
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
          isExpanded ? (
            <div className="flex items-center gap-4 bg-white px-5 pt-4 pb-[calc(24px+var(--safe-area-bottom,0px))]">
              <IconButton
                aria-label={`${restaurant.name} 저장`}
                onClick={onUnavailable}
                className="text-warm-gray-100"
              >
                <SaveBlankIcon className="size-6" />
              </IconButton>
              <Button width="full" onClick={onUnavailable}>
                예약하기
              </Button>
            </div>
          ) : undefined
        }
      >
        <div className="relative min-h-full">
          <header className="sticky top-0 z-20 flex h-12.5 items-center gap-2 bg-white px-5">
            <h2
              className="typo-header-2 text-primary-200 min-w-0 flex-1 truncate"
              title={restaurant.name}
            >
              {restaurant.name}
            </h2>
            <IconButton aria-label="식당 상세 닫기" size="xs" onClick={onClose}>
              <CancelIcon className="size-6" />
            </IconButton>
          </header>
          <div className="px-5 pb-6">
            <div className="flex items-start justify-between gap-2">
              <MapRestaurantMeta restaurant={restaurant} />
              {!isExpanded && (
                <MapSaveAction restaurant={restaurant} onSave={onUnavailable} />
              )}
            </div>
            <div className="mt-5">
              <MapRestaurantImages
                restaurant={restaurant}
                onPhotoSelect={onPhotoSelect}
              />
            </div>
          </div>
          {isExpanded && (
            <>
              <div className="sticky top-12.5 z-10 bg-white px-5">
                <Tabs
                  aria-label="식당 상세 정보"
                  items={TABS.map((tab) => ({
                    ...tab,
                    count:
                      tab.value === 'photo'
                        ? restaurant.images.length
                        : tab.value === 'review'
                          ? restaurant.reviewCount
                          : undefined,
                  }))}
                  value={activeTab}
                  onChange={onTabChange}
                />
              </div>
              <div
                role="tabpanel"
                aria-label={
                  TABS.find(({ value }) => value === activeTab)?.label
                }
                className="min-h-80 px-6 py-9"
              >
                {activeTab === 'info' && (
                  <div className="text-primary-200 flex flex-col gap-9">
                    <section>
                      <h3 className="typo-sub-header-2">가게 상세</h3>
                      <p className="typo-long-body-1 mt-3 break-keep">
                        {restaurant.description}
                      </p>
                    </section>
                    <section>
                      <h3 className="typo-sub-header-2">영업 시간</h3>
                      <p className="typo-body-5 mt-3">
                        샘플 영업시간 · 실제 정보 미연동
                      </p>
                      <dl className="typo-body-5 mt-2 grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                        {['월', '화', '수', '목', '금', '토', '일'].map(
                          (day) => (
                            <div key={day} className="contents">
                              <dt>{day}</dt>
                              <dd>11:00 ~ 22:00</dd>
                            </div>
                          ),
                        )}
                      </dl>
                    </section>
                    <section>
                      <h3 className="typo-sub-header-2">인당 가격대</h3>
                      <p className="typo-body-5 mt-3">{restaurant.price}</p>
                    </section>
                    <section>
                      <h3 className="typo-sub-header-2">위치</h3>
                      <p className="typo-body-5 mt-3">{restaurant.address}</p>
                      <ImageFallback
                        role="img"
                        aria-label="상세 위치 지도 연결 전"
                        className="mt-3 h-36.25 w-full rounded-[5px]"
                      />
                    </section>
                  </div>
                )}
                {activeTab === 'menu' && (
                  <p className="typo-body-7 text-cool-gray-600">
                    메뉴 정보는 API 연결 후 제공됩니다.
                  </p>
                )}
                {activeTab === 'photo' && (
                  <>
                    <p className="typo-caption-1 text-cool-gray-600 mb-3">
                      샘플 사진
                    </p>
                    <MapRestaurantImages
                      restaurant={restaurant}
                      onPhotoSelect={onPhotoSelect}
                    />
                  </>
                )}
                {activeTab === 'review' && (
                  <p className="typo-body-7 text-cool-gray-600">
                    리뷰 정보는 API 연결 후 제공됩니다.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </DragPanel>
    </section>
  )
}
