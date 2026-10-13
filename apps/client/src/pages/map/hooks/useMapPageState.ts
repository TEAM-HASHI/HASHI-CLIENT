import { useEffect, useRef, useState } from 'react'
import {
  MAP_PREVIEW_AREAS,
  MAP_PREVIEW_RESTAURANTS,
} from '@/pages/map/data/mapPreviewRestaurants'
import {
  queryMapPreview,
  type MapPreviewSource,
} from '@/pages/map/data/queryMapPreview'
import type {
  MapBounds,
  MapCameraSnapshot,
  MapConditions,
  MapRestaurant,
} from '@/pages/map/types'
import { getMapAreaMarkers } from '@/pages/map/utils/getMapAreaMarkers'
import { getMapDisplayMode } from '@/pages/map/utils/mapDisplayPolicy'

const AREA_MARKERS = getMapAreaMarkers(
  MAP_PREVIEW_AREAS,
  MAP_PREVIEW_RESTAURANTS,
)
const INITIAL_CONDITIONS: MapConditions = {
  keyword: '',
  category: 'all',
  areaCode: null,
  sort: 'recommended',
}
type Reason = 'initial' | 'area' | 'viewport' | 'conditions' | 'sort'
type EmptyKind = 'region' | 'conditions'

export const useMapPageState = (source: MapPreviewSource = queryMapPreview) => {
  const [draft, setDraft] = useState('')
  const [conditions, setConditions] = useState(INITIAL_CONDITIONS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchBounds, setSearchBounds] = useState<MapBounds | null>(null)
  const [resetVersion, setResetVersion] = useState(0)
  const [isExploring, setIsExploring] = useState(false)
  const camera = useRef<MapCameraSnapshot | null>(null)
  const [cameraRequest, setCameraRequest] = useState<MapCameraSnapshot | null>(
    null,
  )
  const [request, setRequest] = useState({
    conditions: INITIAL_CONDITIONS,
    bounds: null as MapBounds | null,
    reason: 'initial' as Reason,
    camera: null as MapCameraSnapshot | null,
  })
  const [restaurants, setRestaurants] = useState<MapRestaurant[]>([])
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  )
  const [emptyKind, setEmptyKind] = useState<EmptyKind>('conditions')
  const [emptyEvent, setEmptyEvent] = useState<{
    id: number
    kind: EmptyKind
  } | null>(null)
  const [nextCursor, setNextCursor] = useState<string>()
  const [nextError, setNextError] = useState(false)
  const [loadingNext, setLoadingNext] = useState(false)
  const generation = useRef(0)
  const nextPending = useRef(false)
  const emptyKindRef = useRef<EmptyKind>('conditions')

  useEffect(() => {
    const id = ++generation.current
    nextPending.current = false
    void source(request)
      .then((result) => {
        if (generation.current !== id) return
        setRestaurants(result.restaurants)
        setNextCursor(result.nextCursor)
        setStatus('success')
        const kind =
          request.reason === 'sort'
            ? emptyKindRef.current
            : request.reason === 'viewport' || request.reason === 'area'
              ? 'region'
              : 'conditions'
        emptyKindRef.current = kind
        setEmptyKind(kind)
        if (!result.restaurants.length) setEmptyEvent({ id, kind })
        if (request.camera) setCameraRequest({ ...request.camera })
      })
      .catch(() => {
        if (generation.current === id) setStatus('error')
      })
    return () => {
      generation.current++
    }
  }, [request, source])

  const submit = (
    next: MapConditions,
    bounds: MapBounds | null,
    reason: Reason,
  ) => {
    generation.current++
    setLoadingNext(false)
    setNextError(false)
    setStatus('loading')
    setRestaurants([])
    setNextCursor(undefined)
    setEmptyEvent(null)
    setConditions(next)
    setSearchBounds(bounds)
    setSelectedId(null)
    setCameraRequest(null)
    setRequest({
      conditions: next,
      bounds,
      reason,
      camera: reason === 'area' || reason === 'initial' ? null : camera.current,
    })
  }
  const handleConditionsChange = (patch: Partial<MapConditions>) => {
    const next = { ...conditions, ...patch }
    const bounds = patch.areaCode
      ? null
      : next.areaCode
        ? searchBounds
        : (camera.current?.bounds ?? searchBounds)
    setIsExploring(
      patch.areaCode
        ? true
        : getMapDisplayMode({
            zoom: camera.current?.zoom ?? 11,
            previous: isExploring ? 'restaurants' : 'areas',
            hasConditions: !!next.keyword || next.category !== 'all',
          }) === 'restaurants',
    )
    submit(
      next,
      bounds,
      patch.areaCode ? 'area' : patch.sort ? 'sort' : 'conditions',
    )
  }
  const handleReset = () => {
    generation.current++
    camera.current = null
    setCameraRequest(null)
    setDraft('')
    setIsExploring(false)
    setResetVersion((version) => version + 1)
    submit(INITIAL_CONDITIONS, null, 'initial')
  }
  const loadNext = () => {
    if (!nextCursor || nextPending.current || status !== 'success') return
    nextPending.current = true
    setLoadingNext(true)
    setNextError(false)
    const id = generation.current
    void source({
      conditions: request.conditions,
      bounds: request.bounds,
      cursor: nextCursor,
    })
      .then((result) => {
        if (generation.current !== id) return
        setRestaurants((current) => [
          ...new Map(
            [...current, ...result.restaurants].map((item) => [item.id, item]),
          ).values(),
        ])
        setNextCursor(result.nextCursor)
      })
      .catch(() => {
        if (generation.current === id) setNextError(true)
      })
      .finally(() => {
        if (generation.current === id) {
          nextPending.current = false
          setLoadingNext(false)
        }
      })
  }
  return {
    draft,
    setDraft,
    conditions,
    restaurants,
    areas: AREA_MARKERS,
    selectedRestaurant: restaurants.find(({ id }) => id === selectedId) ?? null,
    setSelectedId,
    handleConditionsChange,
    handleReset,
    searchBounds,
    resetVersion,
    isExploring,
    status,
    emptyKind,
    emptyEvent,
    nextCursor,
    nextError,
    loadingNext,
    loadNext,
    retry: () => {
      setStatus('loading')
      setRequest((current) => ({ ...current }))
    },
    cameraRequest,
    handleCameraChange: (value: MapCameraSnapshot) => {
      camera.current = value
    },
    handleUserMove: () => {
      if (conditions.areaCode)
        setConditions((current) => ({ ...current, areaCode: null }))
    },
    handleSearchArea: (bounds: MapBounds) =>
      submit({ ...conditions, areaCode: null }, bounds, 'viewport'),
    handleExplore: () => setIsExploring(true),
    handleOverview: () => setIsExploring(false),
    handleSelectRestaurant: (id: string) => {
      setIsExploring(true)
      setSelectedId(id)
    },
  }
}
