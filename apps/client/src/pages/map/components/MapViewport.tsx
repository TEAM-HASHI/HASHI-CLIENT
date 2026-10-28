import { BackIcon, SaveIcon, CancelIcon } from '@hashi/hds-icons'
import { IconButton } from '@hashi/hds-ui'
import { MapStatusView } from '@/pages/map/components/MapStatusView'
import { MapSearchAreaButton } from '@/pages/map/components/MapSearchAreaButton'
import {
  APIProvider,
  APILoadingStatus,
  AdvancedMarker,
  Map as GoogleMap,
  useApiLoadingStatus,
} from '@vis.gl/react-google-maps'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { MapAreaMarker } from '@/pages/map/components/MapAreaMarker'
import { MapRestaurantMarker } from '@/pages/map/components/MapRestaurantMarker'
import { useGoogleMapCamera } from '@/pages/map/hooks/useGoogleMapCamera'
import { layoutMapAreaLabels } from '@/pages/map/utils/layoutMapAreaLabels'
import { getMapDisplayMode } from '@/pages/map/utils/mapDisplayPolicy'
import type {
  MapAreaMarkerData,
  MapBounds,
  MapCameraSnapshot,
  MapRestaurant,
  MapPosition,
} from '@/pages/map/types'

interface MapViewportProps {
  restaurants: (Pick<
    MapRestaurant,
    'id' | 'name' | 'category' | 'position' | 'attributions'
  > & { rating?: number })[]
  areas: MapAreaMarkerData[]
  selectedId: string | null
  renderRestaurantMarker?: (
    restaurant: MapViewportProps['restaurants'][number],
  ) => ReactNode
  areaCode: string | null
  resetVersion: number
  zoomed: boolean
  panelHeight: number
  onSelectRestaurant: (id: string) => void
  onSelectArea: (code: string) => void
  onSearchArea: (bounds: MapBounds) => void
  onExplore: () => void
  onOverview?: () => void
  hasConditions?: boolean
  onCameraChange?: (camera: MapCameraSnapshot) => void
  onUserMove?: () => void
  cameraRequest?: MapCameraSnapshot | null
  searchPositions?: MapPosition[] | null
  initialBounds?: MapBounds
  initialFitEnabled?: boolean
  onResetArea: () => void
  onSaved: () => void
  savedOpen?: boolean
  onCloseDetail?: () => void
  onCloseCollection?: () => void
  loadingRestaurants?: boolean
  mapUnavailable?: boolean
  onMapFailureChange?: (failed: boolean) => void
}

const MapFailure = ({ configuration = false }: { configuration?: boolean }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-white">
    <MapStatusView
      message={
        configuration
          ? '지도 설정을 확인해주세요.'
          : '지도를 불러오지 못했어요!'
      }
      onRetry={() => window.location.reload()}
    />
  </div>
)

const getAttributionHref = (uri: string) => {
  try {
    const url = new URL(uri)
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.href
      : undefined
  } catch {
    return undefined
  }
}

const MapCoordinateAttributions = ({
  restaurants,
}: Pick<MapViewportProps, 'restaurants'>) => {
  const attributions = Array.from(
    new Map(
      restaurants.flatMap(({ attributions }) =>
        (attributions ?? []).map(
          (attribution) =>
            [
              JSON.stringify([attribution.displayName, attribution.uri]),
              attribution,
            ] as const,
        ),
      ),
    ),
  )
  if (!attributions.length) return null
  return (
    <aside
      aria-label="지도 좌표 출처"
      className="typo-caption-2 text-cool-gray-800 absolute inset-x-5 bottom-21 max-h-16 overflow-y-auto rounded bg-white/95 px-2 py-1"
    >
      <span>좌표 출처: </span>
      {attributions.map(([key, { displayName, uri }], index) => {
        const href = getAttributionHref(uri)
        return (
          <span key={key}>
            {index > 0 && ' · '}
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {displayName}
              </a>
            ) : (
              displayName
            )}
          </span>
        )
      })}
    </aside>
  )
}

const GoogleMapSurface = ({
  restaurants,
  areas,
  selectedId,
  renderRestaurantMarker,
  areaCode,
  resetVersion,
  zoomed,
  onSelectRestaurant,
  onSelectArea,
  onSearchArea,
  onExplore,
  onOverview,
  hasConditions = false,
  onCameraChange,
  onUserMove,
  cameraRequest,
  searchPositions,
  initialBounds,
  initialFitEnabled = true,
  loadingRestaurants = false,
  onMapFailureChange,
}: MapViewportProps) => {
  const status = useApiLoadingStatus()
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null)
  const [searchedBounds, setSearchedBounds] = useState<MapBounds | null>(null)
  const [hasUserMoved, setHasUserMoved] = useState(false)
  const [zoom, setZoom] = useState(11)
  const firstIdleZoom = useRef<number | null>(null)
  const [timedOut, setTimedOut] = useState(false)
  const [authFailed, setAuthFailed] = useState(false)
  const suppressDragClick = useRef(false)
  useEffect(() => {
    const authWindow = window as Window & { gm_authFailure?: () => void }
    const previous = authWindow.gm_authFailure
    const handleAuthFailure = () => {
      setAuthFailed(true)
      previous?.()
    }
    authWindow.gm_authFailure = handleAuthFailure
    return () => {
      if (authWindow.gm_authFailure === handleAuthFailure) {
        authWindow.gm_authFailure = previous
      }
    }
  }, [])
  const ready = status === APILoadingStatus.LOADED && currentBounds !== null
  useEffect(() => {
    if (ready || !initialFitEnabled) return
    const timeout = window.setTimeout(() => setTimedOut(true), 15000)
    return () => window.clearTimeout(timeout)
  }, [ready, initialFitEnabled])
  const {
    userMoved: userMovedRef,
    programmaticMove: programmaticMoveRef,
    minimumZoom,
  } = useGoogleMapCamera(
    areas,
    areas.find(({ code }) => code === areaCode)?.position,
    restaurants.find(({ id }) => id === selectedId)?.position,
    resetVersion,
    cameraRequest,
    searchPositions,
    initialBounds,
    areas.find(({ code }) => code === areaCode)?.cameraBounds,
    initialFitEnabled,
  )
  const failed =
    authFailed ||
    status === APILoadingStatus.FAILED ||
    status === APILoadingStatus.AUTH_FAILURE ||
    (timedOut && !ready)
  const offsets = layoutMapAreaLabels(areas, zoom)
  useEffect(() => {
    onMapFailureChange?.(failed)
  }, [failed, onMapFailureChange])
  const boundsChanged =
    currentBounds &&
    searchedBounds &&
    (['north', 'south', 'east', 'west'] as const).some(
      (key) => Math.abs(currentBounds[key] - searchedBounds[key]) > 0.00001,
    )
  const markUserMove = () => {
    if (!ready) return
    programmaticMoveRef.current = false
    userMovedRef.current = true
    onUserMove?.()
  }
  return (
    <>
      <div
        className="h-full w-full"
        onPointerDownCapture={() => {
          suppressDragClick.current = false
        }}
        onClickCapture={(event) => {
          // Resizing the map as the sheet collapses can put a marker under
          // pointer-up. Do not treat that drag-ending click as a selection.
          if (suppressDragClick.current && event.detail > 0) {
            event.preventDefault()
            event.stopPropagation()
          }
          suppressDragClick.current = false
        }}
        onWheelCapture={markUserMove}
        onDoubleClickCapture={markUserMove}
        onTouchMoveCapture={(event) => {
          if (event.touches.length > 1) markUserMove()
        }}
        onKeyDownCapture={(event) => {
          if (
            [
              'ArrowUp',
              'ArrowDown',
              'ArrowLeft',
              'ArrowRight',
              '+',
              '-',
              '=',
            ].includes(event.key)
          ) {
            markUserMove()
          }
        }}
      >
        {!failed && (
          <GoogleMap
            mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID?.trim()}
            defaultCenter={{ lat: 35.685, lng: 139.75 }}
            defaultZoom={11}
            isFractionalZoomEnabled
            gestureHandling="greedy"
            disableDefaultUI
            clickableIcons={false}
            maxZoom={20}
            onDragstart={() => {
              suppressDragClick.current = true
              markUserMove()
            }}
            onIdle={({ map }) => {
              if (!initialFitEnabled && minimumZoom.current === null) return
              const bounds = map.getBounds()?.toJSON()
              if (!bounds) return
              const nextZoom = map.getZoom() ?? 11
              // The camera hook's first idle listener may run after this one.
              // Keep the fitted scale in the very first published snapshot too.
              firstIdleZoom.current ??= cameraRequest?.minZoom ?? nextZoom
              const overviewZoom =
                minimumZoom.current ?? firstIdleZoom.current ?? nextZoom
              const center = map.getCenter()?.toJSON()
              if (center)
                onCameraChange?.({
                  center,
                  zoom: nextZoom,
                  bounds,
                  minZoom: overviewZoom,
                })
              if (!programmaticMoveRef.current && userMovedRef.current) {
                const mode = getMapDisplayMode({
                  zoom: nextZoom,
                  overviewZoom,
                  previous: zoomed ? 'restaurants' : 'areas',
                  hasConditions,
                })
                if (mode === 'restaurants' && !zoomed) onExplore()
                if (
                  mode === 'areas' &&
                  zoomed &&
                  !selectedId &&
                  nextZoom < zoom
                )
                  onOverview?.()
              }
              setCurrentBounds(bounds)
              if (
                programmaticMoveRef.current ||
                (!userMovedRef.current && !hasUserMoved)
              ) {
                setSearchedBounds(bounds)
              }
              if (programmaticMoveRef.current) {
                setHasUserMoved(false)
              } else if (userMovedRef.current) {
                setHasUserMoved(
                  !!searchedBounds &&
                    (['north', 'south', 'east', 'west'] as const).some(
                      (key) =>
                        Math.abs(bounds[key] - searchedBounds[key]) > 0.00001,
                    ),
                )
              }
              userMovedRef.current = false
              programmaticMoveRef.current = false
              setZoom(nextZoom)
            }}
            className="relative h-full w-full"
          >
            {zoomed
              ? restaurants.map((restaurant) => (
                  <AdvancedMarker
                    key={restaurant.id}
                    position={restaurant.position}
                    anchorLeft="-50%"
                    anchorTop="-50%"
                    zIndex={restaurant.id === selectedId ? 2 : 1}
                  >
                    <div className="pointer-events-auto max-w-[min(60vw,258px)]">
                      {renderRestaurantMarker ? (
                        renderRestaurantMarker(restaurant)
                      ) : (
                        <MapRestaurantMarker
                          restaurant={restaurant}
                          isSelected={restaurant.id === selectedId}
                          onSelect={onSelectRestaurant}
                        />
                      )}
                    </div>
                  </AdvancedMarker>
                ))
              : areas.map((area) => (
                  <AdvancedMarker key={area.code} position={area.position}>
                    <div
                      className="pointer-events-auto relative"
                      style={{
                        transform: `translateY(${offsets[area.code] ?? 0}px)`,
                      }}
                    >
                      {!!offsets[area.code] && (
                        <span
                          aria-hidden="true"
                          className="bg-cool-gray-600 pointer-events-none absolute left-1/2 w-px"
                          style={{
                            height: Math.max(0, offsets[area.code] - 44),
                            bottom: '100%',
                          }}
                        />
                      )}
                      <MapAreaMarker
                        area={area}
                        onSelect={onSelectArea}
                        belowAnchor={!!offsets[area.code]}
                      />
                    </div>
                  </AdvancedMarker>
                ))}
          </GoogleMap>
        )}
        {(!ready || loadingRestaurants) && !failed && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <MapStatusView
              loading
              message={
                ready
                  ? '식당 목록을 불러오고 있어요.'
                  : '지도를 불러오고 있어요.'
              }
            />
          </div>
        )}
        {failed && <MapFailure />}
        {ready &&
          !failed &&
          !loadingRestaurants &&
          hasUserMoved &&
          boundsChanged &&
          currentBounds && (
            <div className="absolute inset-x-0 bottom-8 text-center">
              <MapSearchAreaButton
                onClick={() => {
                  userMovedRef.current = false
                  setHasUserMoved(false)
                  setSearchedBounds(currentBounds)
                  onSearchArea(currentBounds)
                }}
              />
            </div>
          )}
      </div>
      {ready && !failed && zoomed && (
        <MapCoordinateAttributions restaurants={restaurants} />
      )}
    </>
  )
}

export const MapViewport = (props: MapViewportProps) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim()
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID?.trim()
  const onMapFailureChange = props.onMapFailureChange
  useEffect(() => {
    if (!apiKey || !mapId) onMapFailureChange?.(true)
  }, [apiKey, mapId, onMapFailureChange])
  return (
    <>
      <div
        className="bg-secondary-200 absolute inset-x-0 top-0"
        style={{ bottom: Math.max(0, props.panelHeight - 20) }}
        role="region"
        aria-label="도쿄 맛집 지도"
      >
        {apiKey && mapId ? (
          <APIProvider
            apiKey={apiKey}
            language="ko"
            region="JP"
            disableUsageAttribution
            solutionChannel=""
          >
            <GoogleMapSurface {...props} />
          </APIProvider>
        ) : (
          <MapFailure configuration />
        )}
      </div>
      {props.zoomed && !props.mapUnavailable && !props.onCloseCollection && (
        <IconButton
          aria-label="전체 지역 보기"
          variant="soft"
          size="sm"
          className="absolute top-30 left-5 shadow-[0_0_4px_rgba(0,0,0,0.2)]"
          onClick={props.onResetArea}
        >
          <BackIcon className="size-5" />
        </IconButton>
      )}
      {(!props.mapUnavailable || props.onCloseCollection) && (
        <IconButton
          aria-label={
            props.onCloseCollection
              ? '컬렉션 지도 닫기'
              : props.selectedId
                ? '선택한 식당 닫기'
                : '저장 목록 보기'
          }
          aria-pressed={
            props.selectedId || props.onCloseCollection
              ? undefined
              : !!props.savedOpen
          }
          variant="soft"
          className={`absolute left-5 size-11 shadow-[0_0_4px_rgba(0,0,0,0.2)] ${props.savedOpen ? 'bg-cool-gray-900 text-white' : ''}`}
          style={{ bottom: props.panelHeight + 20 }}
          onClick={
            props.onCloseCollection ??
            (props.selectedId ? props.onCloseDetail : props.onSaved)
          }
        >
          {props.onCloseCollection || props.selectedId ? (
            <CancelIcon className="size-6" />
          ) : (
            <SaveIcon
              className={`size-6 ${props.savedOpen ? 'text-white' : 'text-warm-gray-300'}`}
            />
          )}
        </IconButton>
      )}
    </>
  )
}
