import { BackIcon, SaveIcon } from '@hashi/hds-icons'
import { Button, IconButton } from '@hashi/hds-ui'
import {
  APIProvider,
  APILoadingStatus,
  AdvancedMarker,
  Map as GoogleMap,
  useApiLoadingStatus,
} from '@vis.gl/react-google-maps'
import { useEffect, useState } from 'react'
import { MapAreaMarker } from '@/pages/map/components/MapAreaMarker'
import { MapRestaurantMarker } from '@/pages/map/components/MapRestaurantMarker'
import { useGoogleMapCamera } from '@/pages/map/hooks/useGoogleMapCamera'
import { layoutMapAreaLabels } from '@/pages/map/utils/layoutMapAreaLabels'
import type {
  MapAreaMarkerData,
  MapBounds,
  MapRestaurant,
} from '@/pages/map/types'

interface MapViewportProps {
  restaurants: MapRestaurant[]
  areas: MapAreaMarkerData[]
  selectedId: string | null
  areaCode: string | null
  resetVersion: number
  zoomed: boolean
  panelHeight: number
  onSelectRestaurant: (id: string) => void
  onSelectArea: (code: string) => void
  onSearchArea: (bounds: MapBounds) => void
  onExplore: () => void
  onResetArea: () => void
  onSaved: () => void
}

const INDIVIDUAL_PINS_ZOOM = 14

const MapFailure = ({ configuration = false }: { configuration?: boolean }) => (
  <div
    role="alert"
    className="absolute inset-x-5 top-40 rounded-lg bg-white p-4 text-center shadow"
  >
    <p className="typo-body-6">
      {configuration
        ? '지도 설정을 확인해주세요.'
        : '지도를 불러오지 못했어요.'}
    </p>
    <p className="typo-caption-2 text-cool-gray-600 mt-2">
      {configuration
        ? '지도 API 키와 Map ID가 필요해요.'
        : '네트워크 또는 지도 API 설정을 확인한 뒤 다시 시도해주세요.'}
    </p>
    <Button className="mt-3" onClick={() => window.location.reload()}>
      다시 시도
    </Button>
  </div>
)

const GoogleMapSurface = ({
  restaurants,
  areas,
  selectedId,
  areaCode,
  resetVersion,
  zoomed,
  onSelectRestaurant,
  onSelectArea,
  onSearchArea,
  onExplore,
}: MapViewportProps) => {
  const status = useApiLoadingStatus()
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null)
  const [searchedBounds, setSearchedBounds] = useState<MapBounds | null>(null)
  const [hasUserMoved, setHasUserMoved] = useState(false)
  const [zoom, setZoom] = useState(11)
  const [timedOut, setTimedOut] = useState(false)
  const [authFailed, setAuthFailed] = useState(false)
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
    if (ready) return
    const timeout = window.setTimeout(() => setTimedOut(true), 15000)
    return () => window.clearTimeout(timeout)
  }, [ready])
  const { userMoved: userMovedRef, programmaticMove: programmaticMoveRef } =
    useGoogleMapCamera(
      areas,
      areas.find(({ code }) => code === areaCode)?.position,
      restaurants.find(({ id }) => id === selectedId)?.position,
      resetVersion,
    )
  const failed =
    authFailed ||
    status === APILoadingStatus.FAILED ||
    status === APILoadingStatus.AUTH_FAILURE ||
    (timedOut && !ready)
  const offsets = layoutMapAreaLabels(areas, zoom)
  const boundsChanged =
    currentBounds &&
    searchedBounds &&
    (['north', 'south', 'east', 'west'] as const).some(
      (key) => Math.abs(currentBounds[key] - searchedBounds[key]) > 0.00001,
    )
  return (
    <div
      className="h-full w-full"
      onKeyDownCapture={(event) => {
        if (
          ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(
            event.key,
          )
        )
          userMovedRef.current = true
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
            userMovedRef.current = true
          }}
          onZoomChanged={() => {
            if (!programmaticMoveRef.current) userMovedRef.current = true
          }}
          onIdle={({ map }) => {
            const bounds = map.getBounds()?.toJSON()
            if (!bounds) return
            const nextZoom = map.getZoom() ?? 11
            if (
              !zoomed &&
              !programmaticMoveRef.current &&
              userMovedRef.current &&
              nextZoom >= INDIVIDUAL_PINS_ZOOM
            ) {
              onExplore()
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
                    <MapRestaurantMarker
                      restaurant={restaurant}
                      isSelected={restaurant.id === selectedId}
                      onSelect={onSelectRestaurant}
                    />
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
      {!ready && !failed && (
        <p
          role="status"
          className="absolute inset-x-5 top-40 rounded-lg bg-white p-4 text-center"
        >
          지도를 불러오고 있어요.
        </p>
      )}
      {failed && <MapFailure />}
      {ready && !failed && hasUserMoved && boundsChanged && currentBounds && (
        <div className="absolute inset-x-0 bottom-8 text-center">
          <Button
            onClick={() => {
              userMovedRef.current = false
              setHasUserMoved(false)
              setSearchedBounds(currentBounds)
              onSearchArea(currentBounds)
            }}
          >
            현 지도에서 검색
          </Button>
        </div>
      )}
    </div>
  )
}

export const MapViewport = (props: MapViewportProps) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim()
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID?.trim()
  return (
    <>
      <div
        className="bg-secondary-200 absolute inset-x-0 top-0"
        style={{ bottom: props.panelHeight }}
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
      {props.zoomed && (
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
      <IconButton
        aria-label="저장 목록 보기"
        variant="soft"
        className="absolute left-5 size-11 shadow-[0_0_4px_rgba(0,0,0,0.2)]"
        style={{ bottom: props.panelHeight + 48 }}
        onClick={props.onSaved}
      >
        <SaveIcon className="text-warm-gray-300 size-6" />
      </IconButton>
    </>
  )
}
