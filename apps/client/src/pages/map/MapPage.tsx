import { DragPanel } from '@hashi/hds-ui'
import { useLayoutEffect, useRef, useState } from 'react'

import { MapViewportPreview } from '@/pages/map/components/MapViewportPreview'
import { MapToolbar } from '@/pages/map/components/MapToolbar'
import { MapRestaurantList } from '@/pages/map/components/MapRestaurantList'
import { MapRestaurantDetail } from '@/pages/map/components/MapRestaurantDetail'
import { MapPhotoViewer } from '@/pages/map/components/MapPhotoViewer'
import { useMapPanelLayout } from '@/pages/map/hooks/useMapPanelLayout'
import { useMapPreviewState } from '@/pages/map/hooks/useMapPreviewState'
import type { MapConditions, MapPanelStage } from '@/pages/map/types'
import { ComingSoonDialog } from '@/shared/components/comingSoonDialog'

export const MapPage = () => {
  const state = useMapPreviewState()
  const { containerRef, availableHeight } = useMapPanelLayout()
  const [stage, setStage] = useState<MapPanelStage>('normal')
  const [comingSoon, setComingSoon] = useState(false)
  const [detailStage, setDetailStage] = useState<MapPanelStage>('normal')
  const [photoIndex, setPhotoIndex] = useState<number | null>(null)
  const selectionTriggerRef = useRef<HTMLElement | null>(null)
  const photoTriggerRef = useRef<HTMLElement | null>(null)
  const sortTriggerRef = useRef<HTMLButtonElement | null>(null)
  const restoreSortFocus = useRef(false)
  useLayoutEffect(() => {
    if (restoreSortFocus.current) {
      sortTriggerRef.current?.focus({ preventScroll: true })
      restoreSortFocus.current = false
    }
  }, [state.conditions.sort])
  const filtered =
    state.conditions.category !== 'all' ||
    !!state.conditions.keyword ||
    !!state.conditions.areaCode
  const maxHeight = Math.max(30, availableHeight - (filtered ? 125 : 12))
  const normalHeight = Math.min(filtered ? 304 : 312, maxHeight)
  const height =
    stage === 'expanded' ? maxHeight : stage === 'collapsed' ? 30 : normalHeight
  const handleConditionsChange = (patch: Partial<MapConditions>) => {
    state.handleConditionsChange(patch)
    setStage('normal')
  }
  const handleHeightChange = (next: number) =>
    setStage(
      next <= 30 ? 'collapsed' : next >= maxHeight ? 'expanded' : 'normal',
    )
  const handleSelect = (id: string) => {
    selectionTriggerRef.current = document.activeElement as HTMLElement
    state.setSelectedId(id)
    setDetailStage('normal')
  }
  const handleCloseDetail = () => {
    state.setSelectedId(null)
    setPhotoIndex(null)
    // Dialog releases background inertness and restores its scope on the next frame.
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        selectionTriggerRef.current?.focus({ preventScroll: true }),
      ),
    )
  }

  return (
    <main
      ref={containerRef}
      className="relative h-[calc(100dvh-84px-var(--safe-area-bottom,0px))] overflow-hidden bg-white"
    >
      <h1 className="sr-only">도쿄 맛집 지도</h1>
      <div inert={!!state.selectedRestaurant && detailStage === 'expanded'}>
        <MapViewportPreview
          restaurants={state.restaurants}
          selectedId={state.selectedRestaurant?.id ?? null}
          zoomed={
            filtered || stage === 'collapsed' || !!state.selectedRestaurant
          }
          panelHeight={
            state.selectedRestaurant
              ? detailStage === 'collapsed'
                ? 30
                : 294
              : height
          }
          onSelectRestaurant={handleSelect}
          onSelectArea={(areaCode) => handleConditionsChange({ areaCode })}
          onResetArea={() => {
            state.handleReset()
            setStage('normal')
          }}
          onSaved={() => setComingSoon(true)}
        />
        <MapToolbar
          draft={state.draft}
          category={state.conditions.category}
          onDraftChange={state.setDraft}
          onSubmit={() =>
            handleConditionsChange({ keyword: state.draft.trim() })
          }
          onCategoryChange={(category) => handleConditionsChange({ category })}
        />
        <p className="typo-caption-4 text-cool-gray-600 pointer-events-none absolute top-[calc(112px+var(--safe-area-top,0px))] right-5 rounded bg-white/90 px-1">
          샘플 지도 · 실제 위치/예약 미연동
        </p>
        <div
          hidden={!!state.selectedRestaurant}
          className="pointer-events-none absolute inset-0"
        >
          <DragPanel
            key={JSON.stringify(state.conditions)}
            aria-label="지도 식당 목록"
            handleLabel="식당 목록 높이 조절"
            height={height}
            normalHeight={normalHeight}
            maxHeight={maxHeight}
            onHeightChange={handleHeightChange}
          >
            <MapRestaurantList
              restaurants={state.restaurants}
              sort={state.conditions.sort}
              filtered={filtered}
              sortTriggerRef={sortTriggerRef}
              onSortChange={(sort) => {
                restoreSortFocus.current = sort !== state.conditions.sort
                handleConditionsChange({ sort })
              }}
              onSelect={handleSelect}
              onSave={() => setComingSoon(true)}
              onReset={() => {
                state.handleReset()
                setStage('normal')
              }}
            />
          </DragPanel>
        </div>
      </div>
      {state.selectedRestaurant && (
        <MapRestaurantDetail
          key={state.selectedRestaurant.id}
          restaurant={state.selectedRestaurant}
          stage={detailStage}
          onStageChange={setDetailStage}
          onClose={handleCloseDetail}
          onPhotoSelect={(index) => {
            photoTriggerRef.current = document.activeElement as HTMLElement
            setPhotoIndex(index)
          }}
          onUnavailable={() => setComingSoon(true)}
        />
      )}
      {state.selectedRestaurant && photoIndex !== null && (
        <MapPhotoViewer
          images={state.selectedRestaurant.images}
          initialIndex={photoIndex}
          onClose={() => {
            setPhotoIndex(null)
            requestAnimationFrame(() =>
              photoTriggerRef.current?.focus({ preventScroll: true }),
            )
          }}
        />
      )}
      <ComingSoonDialog open={comingSoon} onOpenChange={setComingSoon} />
    </main>
  )
}
