import { DragPanel, showToast } from '@hashi/hds-ui'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/app/router/path'
import { getRestaurantMenuDetailPath } from '@/app/router/routePaths'
import { getRestaurantDetailTabState } from '@/features/restaurantDetail/utils/restaurantDetailRoutes'
import type { RestaurantDetailTab } from '@/features/restaurantDetail/types/restaurantDetail'
import { parseMapSearchContext } from '@/features/mapSearch/utils/parseMapSearchContext'
import { useMapSession } from '@/pages/map/hooks/useMapSession'
import { clearMapSession, readMapSession } from '@/pages/map/utils/mapSession'

import { MapViewport } from '@/pages/map/components/MapViewport'
import { MapToolbar } from '@/pages/map/components/MapToolbar'
import { MapViewButton } from '@/pages/map/components/MapViewButton'
import { MapRestaurantList } from '@/pages/map/components/MapRestaurantList'
import { MapRestaurantDetail } from '@/pages/map/components/MapRestaurantDetail'
import { MapStatusView } from '@/pages/map/components/MapStatusView'
import { useMapPanelLayout } from '@/pages/map/hooks/useMapPanelLayout'
import { useMapPageState } from '@/pages/map/hooks/useMapPageState'
import { useMapRestaurantSaves } from '@/pages/map/hooks/useMapRestaurantSaves'
import type { MapConditions, MapPanelStage } from '@/pages/map/types'
import { ComingSoonDialog } from '@/shared/components/comingSoonDialog'
import mapToastWarning from '@/shared/assets/icons/map-toast-warning.svg'

export const MapPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [initial] = useState(() => readMapSession())
  const state = useMapPageState(initial)
  const restaurants = useMapRestaurantSaves(state.restaurants)
  const selectedRestaurant = restaurants.find(
    (item) => item.id === state.selectedRestaurant?.id,
  )
  const { containerRef, availableHeight } = useMapPanelLayout()
  const [stage, setStage] = useState<MapPanelStage>(initial?.stage ?? 'normal')
  const [previousStatus, setPreviousStatus] = useState(state.status)
  const [comingSoon, setComingSoon] = useState(false)
  const [mapUnavailable, setMapUnavailable] = useState(false)
  const [detailStage, setDetailStage] = useState<MapPanelStage>(
    initial?.detailStage ?? 'normal',
  )
  const [detailTab, setDetailTab] = useState<RestaurantDetailTab>(() => {
    const returnTab =
      location.state?.mapRestaurantId === initial?.selectedId
        ? getRestaurantDetailTabState(location.state).activeTab
        : undefined
    return returnTab ?? initial?.detailTab ?? 'info'
  })
  const [selectionCamera, setSelectionCamera] = useState(
    initial?.selectionCamera ?? null,
  )
  const [selectionIsExploring, setSelectionIsExploring] = useState(
    initial?.selectionIsExploring ?? false,
  )
  const [selectionStage, setSelectionStage] = useState<MapPanelStage>(
    initial?.selectionStage ?? 'normal',
  )
  const [listVersion, setListVersion] = useState(0)
  const selectionTriggerRef = useRef<HTMLElement | null>(null)
  const restoreSelectionFocus = useRef(false)
  const sortTriggerRef = useRef<HTMLButtonElement | null>(null)
  const restoreSortFocus = useRef(false)
  const lastEmptyEvent = useRef<number | null>(null)
  const lastNotice = useRef<number | null>(null)
  const handleReset = () => {
    clearMapSession()
    state.handleReset()
    setStage('normal')
    setDetailStage('normal')
    setDetailTab('info')
  }
  useMapSession(
    {
      conditions: state.conditions,
      searchBounds: state.searchBounds,
      camera: state.cameraSnapshot,
      restaurants: state.status === 'success' ? state.restaurants : undefined,
      queryData: state.queryData,
      emptyKind: state.emptyKind,
      nextCursor: state.nextCursor,
      selectedId: state.selectedRestaurant?.id ?? null,
      isExploring: state.isExploring,
      stage,
      detailStage,
      detailTab,
      selectionCamera,
      selectionIsExploring,
      selectionStage,
    },
    handleReset,
  )
  const resetLocationKey = useRef<string | null>(null)
  const searchLocationKey = useRef<string | null>(null)
  useEffect(() => {
    // A return tab is a one-shot instruction, not persistent history state.
    // Later browser-back restores the tab saved in the map session instead.
    if (typeof location.state?.mapRestaurantId !== 'string') return
    navigate(ROUTES.map, { replace: true, state: null })
  }, [location.state, navigate])
  useEffect(() => {
    const result = parseMapSearchContext(location.state)
    if (!result || searchLocationKey.current === location.key) return
    searchLocationKey.current = location.key
    state.handleConditionsChange({ keyword: result.keyword, areaCode: null })
    setStage('normal')
    navigate(ROUTES.map, { replace: true, state: null })
  }, [location.state, location.key, state, navigate])
  useEffect(() => {
    if (
      location.state?.resetMap !== true ||
      resetLocationKey.current === location.key
    )
      return
    resetLocationKey.current = location.key
    handleReset()
    navigate(ROUTES.map, { replace: true, state: null })
  })
  useEffect(() => {
    if (!state.emptyEvent || lastEmptyEvent.current === state.emptyEvent.id)
      return
    lastEmptyEvent.current = state.emptyEvent.id
    const isRegion = state.emptyEvent.kind === 'region'
    setStage('collapsed')
    showToast({
      icon: <img src={mapToastWarning} alt="" width={26} height={26} />,
      children: isRegion
        ? '이 지역에는 아직 등록된 맛집이 없어요.'
        : '조건에 맞는 맛집이 없어요.',
    })
  }, [state.emptyEvent])
  useEffect(() => {
    if (!state.notice || lastNotice.current === state.notice.id) return
    lastNotice.current = state.notice.id
    showToast({ children: state.notice.message })
  }, [state.notice])
  useLayoutEffect(() => {
    if (restoreSortFocus.current && sortTriggerRef.current) {
      sortTriggerRef.current.focus({ preventScroll: true })
      restoreSortFocus.current = false
    }
  }, [state.conditions.sort, state.status])
  useLayoutEffect(() => {
    if (state.selectedRestaurant || !restoreSelectionFocus.current) return
    let frame: number
    const restore = () => {
      const trigger = selectionTriggerRef.current?.isConnected
        ? selectionTriggerRef.current
        : sortTriggerRef.current
      if (!trigger) return
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
  // Open settled results once, without preventing later user map gestures.
  if (previousStatus !== state.status) {
    setPreviousStatus(state.status)
    if (
      state.status === 'error' ||
      (state.status === 'success' && state.restaurants.length > 0)
    )
      setStage('normal')
  }
  const filtered =
    state.conditions.category !== 'all' ||
    !!state.conditions.keyword ||
    !!state.conditions.areaCode ||
    !!state.searchBounds
  const isEmptyResult =
    state.status === 'success' && state.restaurants.length === 0
  const maxHeight = isEmptyResult
    ? 30
    : Math.max(30, availableHeight - (filtered ? 125 : 12))
  // Keep regional labels and Google attribution visible on shorter phones.
  const normalHeight = Math.min(
    filtered ? 304 : 312,
    maxHeight,
    state.status === 'error'
      ? maxHeight
      : Math.max(state.isExploring ? 156 : 30, availableHeight - 400),
  )
  const height = isEmptyResult
    ? 30
    : stage === 'expanded'
      ? maxHeight
      : stage === 'collapsed'
        ? 30
        : normalHeight
  const handleConditionsChange = (patch: Partial<MapConditions>) => {
    state.handleConditionsChange(patch)
    setStage('normal')
  }
  const handleHeightChange = (next: number) =>
    setStage(
      isEmptyResult || next <= 30
        ? 'collapsed'
        : next >= maxHeight
          ? 'expanded'
          : 'normal',
    )
  const handleSelect = (id: string) => {
    if (!state.selectedRestaurant) {
      setSelectionCamera(state.cameraSnapshot)
      setSelectionIsExploring(state.isExploring)
      setSelectionStage(stage)
    }
    selectionTriggerRef.current = document.activeElement as HTMLElement
    state.handleSelectRestaurant(id)
    setDetailStage('normal')
    setDetailTab('info')
  }
  const handleCloseDetail = () => {
    restoreSelectionFocus.current = true
    state.setSelectedId(null)
    state.restoreCamera(selectionCamera, selectionIsExploring)
    setStage(selectionStage)
    setListVersion((version) => version + 1)
  }
  const handleDetailFailure = () => {
    handleCloseDetail()
    showToast({ children: '식당 정보를 불러오지 못했어요. 다시 선택해주세요.' })
  }
  useEffect(() => {
    if (state.selectionFailed) handleDetailFailure()
  })

  return (
    <main
      ref={containerRef}
      className="relative h-[calc(100dvh-84px-var(--safe-area-bottom,0px))] overflow-hidden bg-white"
    >
      <h1 className="sr-only">도쿄 맛집 지도</h1>
      <div
        inert={
          !!state.selectedRestaurant &&
          detailStage === 'expanded' &&
          !mapUnavailable
        }
      >
        {state.regions ? (
          <MapViewport
            initialBounds={state.regions.initialBounds}
            initialFitEnabled={height <= 312 || !!state.selectedRestaurant}
            loadingRestaurants={state.status === 'loading'}
            mapUnavailable={mapUnavailable}
            onMapFailureChange={setMapUnavailable}
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
            onOverview={state.handleOverview}
            onCameraChange={state.handleCameraChange}
            cameraRequest={state.cameraRequest}
            searchPositions={state.searchPositions}
            onUserMove={() => {
              state.handleUserMove()
              if (state.selectedRestaurant) setDetailStage('collapsed')
              else setStage('collapsed')
            }}
            hasConditions={!!state.conditions.keyword}
            panelHeight={
              mapUnavailable
                ? 0
                : state.selectedRestaurant
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
            onCloseDetail={handleCloseDetail}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <MapStatusView
              loading={state.regionsStatus === 'loading'}
              message={
                state.regionsStatus === 'loading'
                  ? '지도 설정을 불러오고 있어요.'
                  : '지도를 불러오지 못했어요!'
              }
              onRetry={
                state.regionsStatus === 'error' ? state.retryRegions : undefined
              }
            />
          </div>
        )}
        <MapToolbar
          draft={state.conditions.keyword}
          category={state.conditions.category}
          onSearch={() =>
            navigate(ROUTES.search, {
              replace: true,
              state: { source: 'map', keyword: state.conditions.keyword },
            })
          }
          onClear={() =>
            handleConditionsChange({ keyword: '', areaCode: null })
          }
          onCategoryChange={(category) => handleConditionsChange({ category })}
        />
        <div
          hidden={
            !!state.selectedRestaurant || mapUnavailable || !state.regions
          }
          className="pointer-events-none absolute inset-0"
        >
          <DragPanel
            key={JSON.stringify([
              state.conditions,
              state.searchBounds,
              listVersion,
            ])}
            aria-label="지도 식당 목록"
            handleLabel="식당 목록 높이 조절"
            height={height}
            normalHeight={normalHeight}
            maxHeight={maxHeight}
            onHeightChange={handleHeightChange}
            footer={
              <div
                hidden={stage !== 'expanded' || isEmptyResult}
                className="px-5 py-4 text-center"
              >
                <MapViewButton onClick={() => setStage('collapsed')} />
              </div>
            }
          >
            <MapRestaurantList
              active={
                stage !== 'collapsed' &&
                !state.selectedRestaurant &&
                !mapUnavailable &&
                !!state.regions
              }
              status={state.status}
              onRetry={state.errorMessage ? undefined : state.retry}
              retryDisabled={state.retryDisabled}
              errorMessage={state.errorMessage}
              nextCursor={state.nextCursor}
              nextError={state.nextError}
              loadingNext={state.loadingNext}
              onLoadNext={state.loadNext}
              restaurants={restaurants}
              sort={state.conditions.sort}
              filtered={filtered}
              sortTriggerRef={sortTriggerRef}
              onSortChange={(sort) => {
                restoreSortFocus.current = sort !== state.conditions.sort
                handleConditionsChange({ sort })
              }}
              onSelect={handleSelect}
              onSave={() => setComingSoon(true)}
            />
          </DragPanel>
        </div>
      </div>
      {selectedRestaurant && !mapUnavailable && (
        <MapRestaurantDetail
          key={selectedRestaurant.id}
          restaurant={selectedRestaurant}
          stage={detailStage}
          onStageChange={setDetailStage}
          onClose={handleCloseDetail}
          onLoadError={handleDetailFailure}
          onUnavailable={() => setComingSoon(true)}
          initialTab={detailTab}
          onTabChange={setDetailTab}
          onPressMenuItem={(menuId) =>
            navigate(
              getRestaurantMenuDetailPath(selectedRestaurant.id, menuId),
              { state: { source: 'map' } },
            )
          }
        />
      )}
      <ComingSoonDialog open={comingSoon} onOpenChange={setComingSoon} />
    </main>
  )
}
