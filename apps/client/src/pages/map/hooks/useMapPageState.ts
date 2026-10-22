import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { MapNewQuery, MapPageRequest } from '@/pages/map/api/mapApiTypes'
import {
  mapRegionsQueryOptions,
  mapRestaurantLocationQueryOptions,
} from '@/pages/map/queries/mapQueryOptions'
import { useMapRestaurantsQuery } from '@/pages/map/queries/useMapRestaurantsQuery'
import type {
  MapBounds,
  MapCameraSnapshot,
  MapConditions,
  MapSessionSnapshot,
  MapPosition,
} from '@/pages/map/types'
import { getMapDisplayMode } from '@/pages/map/utils/mapDisplayPolicy'
import { checkHasHttpStatus, isApiError } from '@/shared/api/apiError'

const INITIAL_CONDITIONS: MapConditions = {
  keyword: '',
  category: 'all',
  areaCode: null,
  sort: 'recommended',
}
type Reason =
  | 'initial'
  | 'area'
  | 'viewport'
  | 'conditions'
  | 'sort'
  | 'search'
  | 'recovery'
interface MapRequest {
  version: number
  conditions: MapConditions
  bounds: MapBounds | null
  reason: Reason
  camera: MapCameraSnapshot | null
  sessionId?: string
  recoveryQuery?: MapNewQuery
  isFiltered: boolean
}
const apiSort = (sort: MapConditions['sort']) =>
  sort === 'recommended' ? 'recommend' : sort
const hasStatus = (error: unknown, status: number) =>
  checkHasHttpStatus(error) && error.status === status
const validTime = (value: string | undefined, now: number) =>
  !!value && Date.parse(value) > now

export const useMapPageState = (initial: MapSessionSnapshot | null = null) => {
  const regions = useQuery(mapRegionsQueryOptions())
  const [conditions, setConditions] = useState(
    initial?.conditions ?? INITIAL_CONDITIONS,
  )
  const [draft, setDraft] = useState(initial?.conditions.keyword ?? '')
  const [selectedId, setSelectedId] = useState(initial?.selectedId ?? null)
  const [resetVersion, setResetVersion] = useState(0)
  const [isExploring, setIsExploring] = useState(initial?.isExploring ?? false)
  const [cameraSnapshot, setCameraSnapshot] = useState(initial?.camera ?? null)
  const camera = useRef(initial?.camera ?? null)
  const [cameraRequest, setCameraRequest] = useState(initial?.camera ?? null)
  const [searchPositions, setSearchPositions] = useState<MapPosition[] | null>(
    null,
  )
  const [emptyKind, setEmptyKind] = useState<'region' | 'conditions'>(
    initial?.emptyKind ?? 'conditions',
  )
  const [emptyEvent, setEmptyEvent] = useState<{
    id: number
    kind: 'region' | 'conditions'
  } | null>(null)
  const [notice, setNotice] = useState<{ id: number; message: string } | null>(
    null,
  )
  const [clock, setClock] = useState(Date.now)
  const [retryAt, setRetryAt] = useState(0)
  const sequence = useRef(0)
  const [request, setRequest] = useState<MapRequest>({
    version: 0,
    conditions: initial?.conditions ?? INITIAL_CONDITIONS,
    bounds: initial?.searchBounds ?? null,
    reason: 'initial',
    camera: null,
    isFiltered: !!initial?.searchBounds,
  })
  const [restored] = useState(() => {
    const data = initial?.queryData
    return data?.pages.length && validTime(data.pages.at(-1)?.expiresAt, clock)
      ? data
      : undefined
  })
  const [lastSuccess, setLastSuccess] =
    useState<MapSessionSnapshot['queryData']>(restored)
  const lastSuccessRef = useRef(lastSuccess)
  const bounds = request.bounds ?? regions.data?.initialBounds ?? null
  const newQuery = useMemo<MapNewQuery | null>(() => {
    if (request.recoveryQuery) return request.recoveryQuery
    if (!bounds) return null
    return {
      ...bounds,
      sort: apiSort(request.conditions.sort),
      ...(request.conditions.areaCode
        ? { mapRegionId: Number(request.conditions.areaCode) }
        : {}),
      ...(request.conditions.keyword.trim()
        ? { keyword: request.conditions.keyword.trim() }
        : {}),
      ...(request.conditions.category !== 'all'
        ? { placeType: request.conditions.category }
        : {}),
    }
  }, [bounds, request])
  const inputError = useMemo(() => {
    const limits = regions.data?.queryLimits
    if (!newQuery || !limits || request.sessionId) return null
    const { south, north, west, east } = newQuery
    const supported = limits.supportedBounds
    if (
      south < supported.south ||
      north > supported.north ||
      west < supported.west ||
      east > supported.east
    )
      return '이 지역은 아직 지도 검색을 지원하지 않아요.'
    if (
      north - south > limits.maxLatitudeSpan ||
      east - west > limits.maxLongitudeSpan
    )
      return '지도를 더 확대해서 검색해주세요.'
    const keyword = newQuery.keyword ?? ''
    if (
      keyword.length > 30 ||
      (keyword.startsWith('#') &&
        (keyword.length === 1 || /\s/.test(keyword.slice(1))))
    )
      return '검색어는 30자 이내로, 해시태그는 공백 없이 입력해주세요.'
    return null
  }, [newQuery, regions.data, request.sessionId])
  const apiRequest = useMemo<MapPageRequest | null>(() => {
    if (!regions.data || inputError) return null
    return request.sessionId
      ? {
          querySessionId: request.sessionId,
          sort: apiSort(request.conditions.sort),
        }
      : newQuery
  }, [regions.data, inputError, request, newQuery])
  const query = useMapRestaurantsQuery(
    apiRequest,
    request.version,
    request.version === 0 ? restored : undefined,
  )
  const currentFirst = query.data?.pages[0]
  const currentLast = query.data?.pages.at(-1)
  const settled = useRef(restored ? 0 : -1)
  useEffect(() => {
    if (!query.data || !currentFirst || query.isFetchNextPageError) return
    // Query 결과가 실패하면 마지막 성공 목록을 503 복구 화면에 유지한다.
    let active = true
    queueMicrotask(() => {
      if (active) setLastSuccess(query.data)
    })
    lastSuccessRef.current = query.data
    if (settled.current === request.version) return
    settled.current = request.version
    const kind =
      request.reason === 'sort' || request.reason === 'recovery'
        ? emptyKind
        : request.reason === 'viewport' || request.reason === 'area'
          ? 'region'
          : 'conditions'
    setEmptyKind(kind)
    if (!currentFirst.restaurants.length)
      setEmptyEvent({ id: ++sequence.current, kind })
    if (request.camera) setCameraRequest({ ...request.camera })
    if (request.reason === 'search' && request.conditions.keyword) {
      const result = currentFirst.searchResult
      const b = result?.bounds
      setSearchPositions(
        !b || !result?.totalCount
          ? []
          : result.totalCount === 1
            ? [{ lat: b.south, lng: b.west }]
            : [
                { lat: b.south, lng: b.west },
                { lat: b.north, lng: b.east },
              ],
      )
    }
    return () => {
      active = false
    }
  }, [query.data, query.isFetchNextPageError, currentFirst, request, emptyKind])

  const handledError = useRef<Error | null>(null)
  useEffect(() => {
    const error = query.error
    if (!error || query.isFetching || error === handledError.current) return
    handledError.current = error
    const prior = lastSuccessRef.current?.pages.at(-1)
    // Only a failed recovery request is terminal. Once its first page succeeds,
    // the resulting session may expire independently and must be recoverable.
    if (
      hasStatus(error, 410) &&
      prior &&
      (request.reason !== 'recovery' || settled.current === request.version)
    ) {
      const recovered: MapConditions = {
        keyword: prior.query.keyword ?? '',
        category: prior.query.placeType ?? 'all',
        areaCode: prior.query.mapRegionId
          ? String(prior.query.mapRegionId)
          : null,
        sort:
          prior.query.sort === 'recommend' ? 'recommended' : prior.query.sort,
      }
      setConditions(recovered)
      setSelectedId(null)
      setRequest((current) => ({
        ...current,
        conditions: recovered,
        bounds: {
          south: prior.query.south,
          north: prior.query.north,
          west: prior.query.west,
          east: prior.query.east,
        },
        version: current.version + 1,
        reason: 'recovery',
        sessionId: undefined,
        recoveryQuery: prior.query,
        camera: null,
      }))
      return
    }
    if (hasStatus(error, 429)) {
      setRetryAt(Date.now() + 60_000)
      setNotice({
        id: ++sequence.current,
        message: '지도 조회 요청이 많아요. 1분 후 다시 시도해주세요.',
      })
    } else if (isApiError(error) && error.code === 'RESTAURANT-016') {
      setNotice({
        id: ++sequence.current,
        message: '지도를 확대하거나 검색 조건을 조정한 후 다시 시도해주세요.',
      })
    }
  }, [query.error, query.isFetching, request.reason, request.version])

  const preservePrevious =
    hasStatus(query.error, 503) &&
    !query.data &&
    !!lastSuccess?.pages.some((page) => page.restaurants.length > 0)
  const resultData = query.data ?? (preservePrevious ? lastSuccess : undefined)
  const allRestaurants = useMemo(
    () => [
      ...new Map(
        (resultData?.pages.flatMap((page) => page.restaurants) ?? []).map(
          (item) => [item.id, item],
        ),
      ).values(),
    ],
    [resultData],
  )
  const location = useQuery({
    ...mapRestaurantLocationQueryOptions(selectedId ?? ''),
    enabled:
      !!selectedId && allRestaurants.some((item) => item.id === selectedId),
  })
  // Expired coordinates and their sources must disappear, also after backgrounding.
  useEffect(() => {
    const deadlines = allRestaurants
      .map((item) => Date.parse(item.validUntil ?? ''))
      .filter((value) => value > Date.now())
    if (location.data) deadlines.push(Date.parse(location.data.validUntil))
    if (retryAt > Date.now()) deadlines.push(retryAt)
    const next = Math.min(...deadlines.filter((value) => value > Date.now()))
    const timer = Number.isFinite(next)
      ? window.setTimeout(
          () => setClock(Date.now()),
          Math.min(next - Date.now() + 1, 2_147_483_647),
        )
      : undefined
    const refresh = () => setClock(Date.now())
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('pageshow', refresh)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('pageshow', refresh)
    }
  }, [allRestaurants, location.data, retryAt, clock])
  const restaurants = useMemo(
    () =>
      allRestaurants.flatMap((item) => {
        const coordinate =
          item.id === selectedId && location.data ? location.data : item
        if (
          !coordinate.validUntil ||
          Date.parse(coordinate.validUntil) <= clock
        )
          return []
        return [
          {
            ...item,
            position: coordinate.position,
            validUntil: coordinate.validUntil,
            attributions: coordinate.attributions,
          },
        ]
      }),
    [allRestaurants, selectedId, location.data, clock],
  )
  const selectionFailed =
    !!selectedId &&
    (!!location.error ||
      (query.isSuccess &&
        !query.isFetching &&
        !allRestaurants.some((item) => item.id === selectedId)) ||
      (allRestaurants.some((item) => item.id === selectedId) &&
        !restaurants.some((item) => item.id === selectedId)))
  const status: 'loading' | 'success' | 'error' =
    inputError || (query.isError && !query.data && !preservePrevious)
      ? 'error'
      : resultData
        ? 'success'
        : 'loading'
  const submit = (
    next: MapConditions,
    nextBounds: MapBounds | null,
    reason: Reason,
    sessionId?: string,
  ) => {
    setConditions(next)
    setSelectedId(null)
    setEmptyEvent(null)
    setCameraRequest(null)
    setSearchPositions(null)
    setRetryAt(0)
    setRequest((current) => ({
      version: current.version + 1,
      conditions: next,
      bounds: nextBounds,
      reason,
      sessionId,
      isFiltered:
        reason === 'initial'
          ? false
          : reason === 'sort'
            ? current.isFiltered
            : true,
      camera: reason === 'area' || reason === 'initial' ? null : camera.current,
    }))
  }
  const handleConditionsChange = (patch: Partial<MapConditions>) => {
    const next = { ...conditions, ...patch }
    const area = regions.data?.regions.find(
      (item) => item.code === next.areaCode,
    )
    const reason: Reason = patch.areaCode
      ? 'area'
      : patch.keyword !== undefined
        ? 'search'
        : patch.category !== undefined
          ? 'conditions'
          : patch.sort
            ? 'sort'
            : 'conditions'
    const nextBounds = area?.cameraBounds ?? camera.current?.bounds ?? bounds
    const prior = lastSuccessRef.current?.pages.at(-1)
    // A session belongs to one successful query, not merely the latest UI chips.
    const reuseSession =
      reason === 'sort' &&
      prior &&
      query.data &&
      !query.isFetching &&
      !query.isError &&
      validTime(prior.expiresAt, Date.now()) &&
      nextBounds !== null &&
      nextBounds.south === prior.query.south &&
      nextBounds.north === prior.query.north &&
      nextBounds.west === prior.query.west &&
      nextBounds.east === prior.query.east &&
      (prior.query.keyword ?? '') === next.keyword.trim() &&
      (prior.query.placeType ?? 'all') === next.category &&
      (prior.query.mapRegionId ? String(prior.query.mapRegionId) : null) ===
        next.areaCode
    setIsExploring(
      patch.areaCode
        ? true
        : getMapDisplayMode({
            zoom: camera.current?.zoom ?? 11,
            overviewZoom: camera.current?.minZoom,
            previous: isExploring ? 'restaurants' : 'areas',
            hasConditions: !!next.keyword || next.category !== 'all',
          }) === 'restaurants',
    )
    submit(
      next,
      nextBounds,
      reason,
      reuseSession ? prior.querySessionId : undefined,
    )
  }
  const handleReset = () => {
    camera.current = null
    setCameraSnapshot(null)
    setDraft('')
    setIsExploring(false)
    setLastSuccess(undefined)
    lastSuccessRef.current = undefined
    setResetVersion((value) => value + 1)
    submit(INITIAL_CONDITIONS, regions.data?.initialBounds ?? null, 'initial')
  }
  const retryDisabled = retryAt > clock
  const retry = () => {
    if (retryDisabled || inputError) return
    if (query.isFetchNextPageError)
      void query.fetchNextPage({ cancelRefetch: false })
    else void query.refetch()
  }
  return {
    draft,
    setDraft,
    conditions,
    restaurants,
    areas: regions.data?.regions ?? [],
    regions: regions.data,
    regionsStatus: regions.isError
      ? ('error' as const)
      : regions.data
        ? ('success' as const)
        : ('loading' as const),
    retryRegions: () => {
      void regions.refetch()
    },
    selectedRestaurant:
      restaurants.find((item) => item.id === selectedId) ?? null,
    selectionFailed,
    setSelectedId,
    handleConditionsChange,
    handleReset,
    searchBounds: request.isFiltered ? bounds : null,
    resetVersion,
    isExploring,
    status,
    emptyKind,
    emptyEvent,
    notice,
    errorMessage: inputError ?? undefined,
    queryData:
      status === 'success' && !preservePrevious ? query.data : undefined,
    nextCursor: currentLast?.nextCursor,
    nextError: query.isFetchNextPageError || preservePrevious,
    loadingNext: query.isFetchingNextPage,
    retryDisabled,
    loadNext: () => {
      if (retryDisabled) return
      if (preservePrevious) {
        retry()
        return
      }
      if (query.hasNextPage && !query.isFetching)
        void query.fetchNextPage({ cancelRefetch: false })
    },
    retry,
    cameraRequest,
    searchPositions,
    cameraSnapshot,
    restoreCamera: (value: MapCameraSnapshot | null, wasExploring: boolean) => {
      setCameraRequest(value ? { ...value } : null)
      setIsExploring(wasExploring)
      if (!value) setResetVersion((current) => current + 1)
    },
    handleCameraChange: (value: MapCameraSnapshot) => {
      camera.current = value
      setCameraSnapshot(value)
    },
    handleUserMove: () => {
      if (conditions.areaCode)
        setConditions((current) => ({ ...current, areaCode: null }))
    },
    handleSearchArea: (nextBounds: MapBounds) =>
      submit({ ...conditions, areaCode: null }, nextBounds, 'viewport'),
    handleExplore: () => setIsExploring(true),
    handleOverview: () => {
      if (conditions.keyword || selectedId) return
      setIsExploring(false)
      if (conditions.category !== 'all')
        submit(
          { ...conditions, category: 'all', areaCode: null },
          camera.current?.bounds ?? bounds,
          'viewport',
        )
    },
    handleSelectRestaurant: (id: string) => {
      setIsExploring(true)
      setSelectedId(id)
    },
  }
}
