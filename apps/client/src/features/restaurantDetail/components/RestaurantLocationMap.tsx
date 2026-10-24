import { Button } from '@hashi/hds-ui'
import { useQuery } from '@tanstack/react-query'
import {
  AdvancedMarker,
  APIProvider,
  APILoadingStatus,
  Map as GoogleMap,
  useApiLoadingStatus,
} from '@vis.gl/react-google-maps'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { mapRestaurantLocationQueryOptions } from '@/pages/map/queries/mapQueryOptions'
import type { MapPosition } from '@/pages/map/types'

const MapFeedback = ({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) => (
  <div
    role="status"
    className="typo-body-7 text-primary-200 flex h-full flex-col items-center justify-center gap-2"
  >
    <p>{message}</p>
    {onRetry && (
      <Button size="sm" variant="neutral" onClick={onRetry}>
        다시 시도
      </Button>
    )}
  </div>
)

const LocationMapSurface = ({
  position,
  onRetry,
}: {
  position: MapPosition
  onRetry: () => void
}) => {
  const status = useApiLoadingStatus()
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
      if (authWindow.gm_authFailure === handleAuthFailure)
        authWindow.gm_authFailure = previous
    }
  }, [])
  useEffect(() => {
    if (status === APILoadingStatus.LOADED) return
    const timer = window.setTimeout(() => setTimedOut(true), 15_000)
    return () => window.clearTimeout(timer)
  }, [status])
  if (
    authFailed ||
    status === APILoadingStatus.FAILED ||
    status === APILoadingStatus.AUTH_FAILURE ||
    (timedOut && status !== APILoadingStatus.LOADED)
  ) {
    return <MapFeedback message="지도를 불러오지 못했어요." onRetry={onRetry} />
  }
  if (status !== APILoadingStatus.LOADED)
    return <MapFeedback message="지도를 불러오는 중이에요." />
  return (
    <GoogleMap
      mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID?.trim()}
      defaultCenter={position}
      defaultZoom={16}
      gestureHandling="cooperative"
      disableDefaultUI
      zoomControl
      clickableIcons={false}
    >
      <AdvancedMarker position={position} />
    </GoogleMap>
  )
}

export const RestaurantLocationMap = ({
  restaurantId,
}: {
  restaurantId: string
}) => {
  const routeLocation = useLocation()
  const navigate = useNavigate()
  const query = useQuery({
    ...mapRestaurantLocationQueryOptions(restaurantId),
    refetchOnMount: false,
  })
  const [clock, setClock] = useState(Date.now)
  const location = query.data
  useEffect(() => {
    const scrollY = routeLocation.state?.mapRetryScrollY
    if (typeof scrollY !== 'number' || !Number.isFinite(scrollY)) return
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY, behavior: 'instant' })
      void navigate(routeLocation, {
        replace: true,
        state: { ...routeLocation.state, mapRetryScrollY: undefined },
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [routeLocation, navigate])
  const retryMap = () => {
    // The SDK loader is global; a failed load requires a reload.
    void navigate(routeLocation, {
      replace: true,
      state: {
        ...routeLocation.state,
        restaurantId: Number(restaurantId),
        activeTab: 'info',
        mapRetryScrollY: window.scrollY,
      },
    })
    window.location.reload()
  }
  useEffect(() => {
    if (!location) return
    const refreshClock = () => setClock(Date.now())
    const expiresAt = Date.parse(location.validUntil)
    const timer =
      expiresAt > clock
        ? window.setTimeout(
            refreshClock,
            Math.min(2_147_483_647, Math.max(0, expiresAt - Date.now())),
          )
        : undefined
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshClock()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('pageshow', refreshClock)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('pageshow', refreshClock)
    }
  }, [location, clock])
  const available =
    !!location && Date.parse(location.validUntil) > clock && !query.error
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim()
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID?.trim()

  return (
    <>
      <div
        className="bg-secondary-200 relative mt-3 h-[145px] w-full overflow-hidden rounded-[5px]"
        role="region"
        aria-label="식당 위치 지도"
      >
        {query.isPending ? (
          <MapFeedback message="위치를 불러오는 중이에요." />
        ) : !available ? (
          <MapFeedback
            message="현재 표시할 수 있는 식당 위치가 없어요."
            onRetry={() => void query.refetch()}
          />
        ) : !apiKey || !mapId ? (
          <MapFeedback message="지도를 불러올 수 없어요." />
        ) : (
          <APIProvider
            apiKey={apiKey}
            language="ko"
            region="JP"
            disableUsageAttribution
            solutionChannel=""
          >
            <LocationMapSurface
              position={location.position}
              onRetry={retryMap}
            />
          </APIProvider>
        )}
      </div>
      {available && location.attributions.length > 0 && (
        <p
          className="typo-caption-3 text-primary-200 mt-1"
          aria-label="지도 좌표 출처"
        >
          {location.attributions.map(({ displayName, uri }, index) => (
            <span key={`${displayName}:${uri}`}>
              {index > 0 && ' · '}
              <a
                href={uri}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {displayName}
              </a>
            </span>
          ))}
        </p>
      )}
    </>
  )
}
