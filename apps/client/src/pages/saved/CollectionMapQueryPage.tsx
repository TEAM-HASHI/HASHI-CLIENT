import { CancelIcon } from '@hashi/hds-icons'
import {
  Button,
  DragPanel,
  DRAG_PANEL_HEIGHTS,
  IconButton,
} from '@hashi/hds-ui'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  getCollectionDetailPath,
  getRestaurantDetailPath,
} from '@/app/router/routePaths'
import { ROUTES } from '@/app/router/path'
import { MapViewport } from '@/pages/map/components/MapViewport'
import { useMapPanelLayout } from '@/pages/map/hooks/useMapPanelLayout'
import { mapRegionsQueryOptions } from '@/pages/map/queries/mapQueryOptions'
import { getCollectionMapMarkers } from '@/pages/saved/api/getCollectionMapMarkers'
import { useCollectionSessionVersion } from '@/features/collection/hooks/useCollectionSessionVersion'
import { collectionQueryKeys } from '@/features/collection/queries/collectionQueryKeys'
import { useCollectionQuery } from '@/features/collection/queries/useCollectionQuery'
import { SavedApiPage } from '@/pages/saved/SavedApiPage'
import { CollectionMapMarker } from '@/pages/saved/components/CollectionMapMarker'
import type { CollectionMapState } from '@/features/collection/types'
import { runWithCollectionSession } from '@/features/collection/utils/collectionSession'
import { getErrorPresentation } from '@/shared/api/errorPresentation'
import { useAuthStatus } from '@/shared/hooks/useAuthStatus'

/** 기존 지도와 컬렉션 API 화면을 조립한다. 전체 핀은 목록 추가 조회와 독립적이다. */
export const CollectionMapQueryPage = ({
  view,
}: {
  view: CollectionMapState
}) => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { isAuthenticated } = useAuthStatus()
  const version = useCollectionSessionVersion()
  const id = Number(view.collectionId)
  const detail = useCollectionQuery(id, !isAuthenticated)
  const markers = useQuery({
    queryKey: collectionQueryKeys.mapMarkers(id, version, !isAuthenticated),
    queryFn: ({ signal }) =>
      runWithCollectionSession(version, () =>
        getCollectionMapMarkers(id, signal),
      ),
    staleTime: 0,
    gcTime: 0,
    throwOnError: false,
  })
  const regions = useQuery(mapRegionsQueryOptions())
  const { containerRef, availableHeight } = useMapPanelLayout()
  const [height, setHeight] = useState<number>(DRAG_PANEL_HEIGHTS.normal)
  const panelHeight = Math.min(
    height,
    DRAG_PANEL_HEIGHTS.maximum,
    Math.max(30, availableHeight),
  )
  const [clock, setClock] = useState(Date.now)
  useEffect(() => {
    const update = () => setClock(Date.now())
    const next = Math.min(
      ...(markers.data ?? [])
        .map((item) => Date.parse(item.validUntil))
        .filter((time) => time > Date.now()),
    )
    const timer = Number.isFinite(next)
      ? window.setTimeout(update, Math.min(next - Date.now() + 1, 2147483647))
      : undefined
    document.addEventListener('visibilitychange', update)
    window.addEventListener('pageshow', update)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', update)
      window.removeEventListener('pageshow', update)
    }
  }, [markers.data, clock])
  const error = detail.error ?? markers.error ?? regions.error
  const pins = useMemo(
    () =>
      !error && detail.data
        ? (markers.data ?? []).filter(
            (item) => Date.parse(item.validUntil) > clock,
          )
        : [],
    [error, detail.data, markers.data, clock],
  )
  const positions = useMemo(() => pins.map((pin) => pin.position), [pins])
  const close = () => {
    if (view.origin === 'map') {
      navigate(ROUTES.map, {
        replace: true,
        state: {
          mapSavedCollectionsOpen: true,
          mapSavedCollectionsSession: version,
        },
      })
      return
    }
    navigate(
      `${getCollectionDetailPath(view.collectionId)}?${new URLSearchParams({ sort: params.get('sort') ?? view.sort, category: params.get('category') ?? view.category })}`,
      { replace: true },
    )
  }
  return (
    <main
      ref={containerRef}
      className="relative h-[calc(100dvh-84px-var(--safe-area-bottom,0px))] overflow-hidden"
    >
      {regions.data && (
        <MapViewport
          restaurants={pins}
          renderRestaurantMarker={(restaurant) => (
            <CollectionMapMarker
              name={restaurant.name}
              color={detail.data?.color}
              onSelect={() => navigate(getRestaurantDetailPath(restaurant.id))}
            />
          )}
          areas={[]}
          selectedId={null}
          areaCode={null}
          resetVersion={0}
          zoomed
          panelHeight={panelHeight}
          initialBounds={regions.data.initialBounds}
          searchPositions={positions}
          hasConditions
          onSelectRestaurant={(restaurantId) =>
            navigate(getRestaurantDetailPath(restaurantId))
          }
          onSelectArea={() => {}}
          onSearchArea={() => {}}
          onExplore={() => {}}
          onResetArea={() => {}}
          onSaved={close}
          onCloseCollection={close}
          onUserMove={() => setHeight(30)}
        />
      )}
      {!regions.data && (
        <IconButton
          aria-label="컬렉션 지도 닫기"
          variant="soft"
          className="absolute left-5 size-11"
          style={{ bottom: panelHeight + 20 }}
          onClick={close}
        >
          <CancelIcon className="size-6" />
        </IconButton>
      )}
      {error && (
        <div
          role="alert"
          className="absolute inset-x-5 top-20 z-10 bg-white p-4"
        >
          {getErrorPresentation(error).message}
          <Button
            onClick={() => {
              void detail.refetch()
              void markers.refetch()
              void regions.refetch()
            }}
          >
            다시 시도
          </Button>
        </div>
      )}
      <DragPanel
        aria-label="저장 컬렉션 패널"
        handleLabel="컬렉션 패널 높이"
        height={height}
        onHeightChange={setHeight}
      >
        <SavedApiPage embedded />
      </DragPanel>
    </main>
  )
}
