import { DragPanel } from '@hashi/hds-ui'
import { useLayoutEffect, useRef, useState } from 'react'

import { MapViewport } from '@/pages/map/components/MapViewport'
import { MapToolbar } from '@/pages/map/components/MapToolbar'
import { MapViewButton } from '@/pages/map/components/MapViewButton'
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
  const restoreSelectionFocus = useRef(false)
  const photoTriggerRef = useRef<HTMLElement | null>(null)
  const sortTriggerRef = useRef<HTMLButtonElement | null>(null)
  const restoreSortFocus = useRef(false)
  useLayoutEffect(() => {
    if (restoreSortFocus.current) {
      sortTriggerRef.current?.focus({ preventScroll: true })
      restoreSortFocus.current = false
    }
  }, [state.conditions.sort])
  useLayoutEffect(() => {
    if (state.selectedRestaurant || !restoreSelectionFocus.current) return
    let frame: number
    const restore = () => {
      const trigger = selectionTriggerRef.current
      if (!trigger?.isConnected) return
      // Modal isolation may outlive the page state update. Wait for its
      // actual release rather than guessing a number of animation frames.
      if (trigger.closest('[inert], [hidden]')) {
        frame = requestAnimationFrame(restore)
        return
      }
      trigger.focus({ preventScroll: true })
      restoreSelectionFocus.current = false
    }
    frame = requestAnimationFrame(restore)
    return () => cancelAnimationFrame(frame)
  }, [state.selectedRestaurant])
  const filtered =
    state.conditions.category !== 'all' ||
    !!state.conditions.keyword ||
    !!state.conditions.areaCode ||
    !!state.searchBounds
  const maxHeight = Math.max(30, availableHeight - (filtered ? 125 : 12))
  // Keep regional labels and Google attribution visible on shorter phones.
  const normalHeight = Math.min(
    filtered ? 304 : 312,
    maxHeight,
    Math.max(state.isExploring ? 156 : 30, availableHeight - 400),
  )
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
    state.handleSelectRestaurant(id)
    setDetailStage('normal')
  }
  const handleCloseDetail = () => {
    restoreSelectionFocus.current = true
    state.setSelectedId(null)
    setPhotoIndex(null)
  }

  return (
    <main
      ref={containerRef}
      className="relative h-[calc(100dvh-84px-var(--safe-area-bottom,0px))] overflow-hidden bg-white"
    >
      <h1 className="sr-only">도쿄 맛집 지도</h1>
      <div inert={!!state.selectedRestaurant && detailStage === 'expanded'}>
        <MapViewport
          restaurants={state.restaurants}
          areas={state.areas}
          selectedId={state.selectedRestaurant?.id ?? null}
          areaCode={state.conditions.areaCode}
          resetVersion={state.resetVersion}
          onSearchArea={(bounds) => {
            state.handleSearchArea(bounds)
            setStage('normal')
          }}
          zoomed={state.isExploring}
          onExplore={state.handleExplore}
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
          샘플 식당 · 실제 매장 위치/예약 미연동
        </p>
        <div
          hidden={!!state.selectedRestaurant}
          className="pointer-events-none absolute inset-0"
        >
          <DragPanel
            key={JSON.stringify([state.conditions, state.searchBounds])}
            aria-label="지도 식당 목록"
            handleLabel="식당 목록 높이 조절"
            height={height}
            normalHeight={normalHeight}
            maxHeight={maxHeight}
            onHeightChange={handleHeightChange}
            footer={
              <div
                hidden={stage !== 'expanded'}
                className="px-5 py-4 text-center"
              >
                <MapViewButton onClick={() => setStage('collapsed')} />
              </div>
            }
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
