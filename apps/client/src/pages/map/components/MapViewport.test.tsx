import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { MapViewport } from '@/pages/map/components/MapViewport'

const sdk = vi.hoisted(() => ({
  status: 'LOADED',
  zoom: 12,
  initialZoom: 11,
  withCamera: false,
  idle: () => {},
  dragStart: () => {},
  map: {
    fitBounds: vi.fn(),
    moveCamera: vi.fn(),
    panTo: vi.fn(),
    setZoom: vi.fn(),
    getZoom: () => sdk.initialZoom,
    setOptions: vi.fn(),
    addListener: vi.fn((_name: string, callback: () => void) => {
      sdk.idle = callback
      return { remove: vi.fn() }
    }),
  },
}))
vi.mock('@vis.gl/react-google-maps', () => ({
  APIProvider: ({ children }: PropsWithChildren) => children,
  APILoadingStatus: {
    LOADED: 'LOADED',
    FAILED: 'FAILED',
    AUTH_FAILURE: 'AUTH_FAILURE',
  },
  useApiLoadingStatus: () => sdk.status,
  useMap: () => (sdk.withCamera ? sdk.map : null),
  AdvancedMarker: ({ children }: PropsWithChildren) => children,
  Map: ({
    children,
    onIdle,
    onZoomChanged,
    onDragstart,
  }: PropsWithChildren<{
    onIdle: (event: unknown) => void
    onZoomChanged?: () => void
    onDragstart: () => void
  }>) => {
    sdk.dragStart = onDragstart
    return (
      <div onWheel={onZoomChanged}>
        <button onClick={onZoomChanged}>자동 zoom</button>
        <button
          onClick={() =>
            onIdle({
              map: {
                getZoom: () => sdk.initialZoom,
                getCenter: () => ({
                  toJSON: () => ({ lat: 35.5, lng: 139.5 }),
                }),
                getBounds: () => ({
                  toJSON: () => ({
                    north: 36,
                    south: 35,
                    west: 139,
                    east: 140,
                  }),
                }),
              },
            })
          }
        >
          초기 idle
        </button>
        <button
          onClick={() =>
            onIdle({
              map: {
                getZoom: () => sdk.zoom,
                getCenter: () => ({
                  toJSON: () => ({ lat: 36.5, lng: 140.5 }),
                }),
                getBounds: () => ({
                  toJSON: () => ({
                    north: 37,
                    south: 36,
                    west: 140,
                    east: 141,
                  }),
                }),
              },
            })
          }
        >
          이동 idle
        </button>
        {children}
      </div>
    )
  },
}))

const props = {
  restaurants: [],
  areas: [],
  selectedId: null,
  areaCode: null,
  resetVersion: 0,
  zoomed: false,
  panelHeight: 312,
  onSelectRestaurant: vi.fn(),
  onSelectArea: vi.fn(),
  onResetArea: vi.fn(),
  onSaved: vi.fn(),
  onSearchArea: vi.fn(),
  onExplore: vi.fn(),
  onOverview: vi.fn(),
}
const restaurant = {
  id: 'restaurant-1',
  name: '출처 확인 식당',
  areaCode: 'area-1',
  category: 'restaurant' as const,
  cuisine: '일식',
  rating: 4.2,
  reviewCount: 12,
  saveCount: 4,
  recommendationRank: 1,
  menuKeywords: [],
  images: [],
  hours: '',
  price: '',
  description: '',
  address: '',
  position: { lat: 35.7, lng: 139.7 },
}
beforeEach(() => {
  vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'test-key')
  vi.stubEnv('VITE_GOOGLE_MAPS_MAP_ID', 'DEMO_MAP_ID')
  sdk.status = 'LOADED'
  sdk.zoom = 12
  sdk.initialZoom = 11
  sdk.withCamera = false
})

it('fits the server overview and then the selected region bounds without offering manual search', () => {
  sdk.withCamera = true
  const initialBounds = { north: 35.9, south: 35.5, east: 139.95, west: 139.4 }
  const cameraBounds = { north: 35.74, south: 35.68, east: 139.8, west: 139.72 }
  render(
    <MapViewport
      {...props}
      initialBounds={initialBounds}
      areaCode="area-1"
      zoomed
      areas={[
        {
          code: 'area-1',
          name: '지역',
          position: { lat: 35.71, lng: 139.76 },
          cameraBounds,
          restaurantCount: 1,
        },
      ]}
    />,
  )
  expect(sdk.map.fitBounds).toHaveBeenCalledWith(
    initialBounds,
    expect.anything(),
  )
  fireEvent.click(screen.getByText('초기 idle'))
  act(() => sdk.idle())
  expect(sdk.map.fitBounds).toHaveBeenLastCalledWith(
    cameraBounds,
    expect.anything(),
  )
  fireEvent.click(screen.getByText('이동 idle'))
  expect(props.onSearchArea).not.toHaveBeenCalled()
  expect(
    screen.queryByRole('button', { name: '현재 위치에서 검색' }),
  ).not.toBeInTheDocument()
  expect(sdk.map.setOptions).toHaveBeenCalledExactlyOnceWith({ minZoom: 11 })
})

it('shows each visible coordinate source once and removes them in region mode', () => {
  const attribution = {
    displayName: '좌표 제공자',
    uri: 'https://example.com/credits',
  }
  const restaurants = [
    { ...restaurant, attributions: [attribution] },
    { ...restaurant, id: 'restaurant-2', attributions: [attribution] },
  ]
  const view = render(
    <MapViewport {...props} restaurants={restaurants} zoomed />,
  )
  fireEvent.click(screen.getByText('초기 idle'))
  expect(
    screen.getByRole('complementary', { name: '지도 좌표 출처' }),
  ).toBeVisible()
  expect(screen.getAllByRole('link', { name: '좌표 제공자' })).toHaveLength(1)
  expect(screen.getByRole('link', { name: '좌표 제공자' })).toHaveAttribute(
    'href',
    'https://example.com/credits',
  )
  view.rerender(<MapViewport {...props} restaurants={restaurants} />)
  expect(
    screen.queryByRole('complementary', { name: '지도 좌표 출처' }),
  ).not.toBeInTheDocument()
})

it.each([
  'javascript:alert(1)',
  'data:text/html,unsafe',
  '//example.com/credits',
  'not a URL',
])('keeps the attribution name without an unsafe link for %s', (uri) => {
  render(
    <MapViewport
      {...props}
      zoomed
      restaurants={[
        { ...restaurant, attributions: [{ displayName: '좌표 제공자', uri }] },
      ]}
    />,
  )
  fireEvent.click(screen.getByText('초기 idle'))
  expect(screen.getByText('좌표 제공자')).toBeVisible()
  expect(
    screen.queryByRole('link', { name: '좌표 제공자' }),
  ).not.toBeInTheDocument()
})

it('supports HTTP attribution links and hides attribution after SDK failure', () => {
  render(
    <MapViewport
      {...props}
      zoomed
      restaurants={[
        {
          ...restaurant,
          attributions: [
            { displayName: '좌표 제공자', uri: 'http://example.com/credits' },
          ],
        },
      ]}
    />,
  )
  fireEvent.click(screen.getByText('초기 idle'))
  expect(screen.getByRole('link', { name: '좌표 제공자' })).toHaveAttribute(
    'href',
    'http://example.com/credits',
  )
  act(() =>
    (window as Window & { gm_authFailure?: () => void }).gm_authFailure?.(),
  )
  expect(
    screen.queryByRole('complementary', { name: '지도 좌표 출처' }),
  ).not.toBeInTheDocument()
})

it('does not treat scrolling the coordinate credits as a map gesture', () => {
  const onUserMove = vi.fn()
  render(
    <MapViewport
      {...props}
      zoomed
      onUserMove={onUserMove}
      restaurants={[
        {
          ...restaurant,
          attributions: [
            { displayName: '좌표 제공자', uri: 'https://example.com' },
          ],
        },
      ]}
    />,
  )
  fireEvent.click(screen.getByText('초기 idle'))
  fireEvent.wheel(screen.getByRole('complementary', { name: '지도 좌표 출처' }))
  expect(onUserMove).not.toHaveBeenCalled()
})

it('ignores marker clicks generated by map dragging but accepts the next intentional click', () => {
  const onSelectRestaurant = vi.fn()
  render(
    <MapViewport
      {...props}
      restaurants={[restaurant]}
      zoomed
      selectedId={restaurant.id}
      onSelectRestaurant={onSelectRestaurant}
    />,
  )
  fireEvent.click(screen.getByText('초기 idle'))
  const marker = screen.getByRole('button', {
    name: '출처 확인 식당 지도 마커',
  })
  act(() => sdk.dragStart())
  fireEvent.click(marker, { detail: 1 })
  expect(onSelectRestaurant).not.toHaveBeenCalled()
  fireEvent.pointerDown(marker)
  fireEvent.click(marker, { detail: 1 })
  expect(onSelectRestaurant).toHaveBeenCalledExactlyOnceWith(restaurant.id)
})

it('shows map loading while restaurant results refresh after the SDK is ready', () => {
  render(<MapViewport {...props} loadingRestaurants />)
  fireEvent.click(screen.getByText('초기 idle'))
  expect(screen.getByRole('status')).toHaveTextContent(
    '식당 목록을 불러오고 있어요.',
  )
})

it('restores region mode when the user zooms back out without conditions', () => {
  render(<MapViewport {...props} zoomed />)
  fireEvent.click(screen.getByText('초기 idle'))
  sdk.zoom = 15
  fireEvent.click(screen.getByText('이동 idle'))
  sdk.zoom = 11
  fireEvent.wheel(screen.getByText('이동 idle'))
  fireEvent.click(screen.getByText('이동 idle'))
  expect(props.onOverview).toHaveBeenCalledOnce()
})

it('keeps pins and category on a pan at the initial scale rather than auto-querying', () => {
  render(<MapViewport {...props} zoomed />)
  fireEvent.click(screen.getByText('초기 idle'))
  sdk.zoom = 11
  fireEvent.wheel(screen.getByText('이동 idle'))
  fireEvent.click(screen.getByText('이동 idle'))
  expect(props.onOverview).not.toHaveBeenCalled()
  expect(props.onSearchArea).not.toHaveBeenCalled()
  expect(
    screen.getByRole('button', { name: '현재 위치에서 검색' }),
  ).toBeVisible()
})

it('reports camera snapshots but does not collapse panels for resize-only idle', () => {
  const onCameraChange = vi.fn()
  const onUserMove = vi.fn()
  render(
    <MapViewport
      {...props}
      onCameraChange={onCameraChange}
      onUserMove={onUserMove}
    />,
  )
  fireEvent.click(screen.getByText('초기 idle'))
  fireEvent.click(screen.getByText('이동 idle'))
  fireEvent.click(screen.getByText('자동 zoom'))
  expect(onUserMove).not.toHaveBeenCalled()
  expect(onCameraChange).toHaveBeenLastCalledWith({
    center: { lat: 36.5, lng: 140.5 },
    zoom: 12,
    bounds: { north: 37, south: 36, west: 140, east: 141 },
    minZoom: 11,
  })
  fireEvent.wheel(screen.getByText('이동 idle'))
  expect(onUserMove).toHaveBeenCalledOnce()
})

it('reports the first fitted scale even before the camera hook idle listener runs', () => {
  const onCameraChange = vi.fn()
  sdk.initialZoom = 11.75
  render(<MapViewport {...props} onCameraChange={onCameraChange} />)
  fireEvent.click(screen.getByText('초기 idle'))
  expect(onCameraChange).toHaveBeenLastCalledWith(
    expect.objectContaining({ minZoom: 11.75 }),
  )
  sdk.zoom = 12.75
  fireEvent.wheel(screen.getByText('이동 idle'))
  fireEvent.click(screen.getByText('이동 idle'))
  expect(onCameraChange).toHaveBeenLastCalledWith(
    expect.objectContaining({ minZoom: 11.75 }),
  )
  expect(props.onExplore).toHaveBeenCalledOnce()
})

it('enters exploration only after user zoom reaches the neighborhood threshold', () => {
  render(<MapViewport {...props} />)
  fireEvent.click(screen.getByText('초기 idle'))
  sdk.zoom = 11.9
  fireEvent.wheel(screen.getByText('이동 idle'))
  fireEvent.click(screen.getByText('이동 idle'))
  expect(props.onExplore).not.toHaveBeenCalled()
  sdk.zoom = 12
  fireEvent.wheel(screen.getByText('이동 idle'))
  fireEvent.click(screen.getByText('이동 idle'))
  expect(props.onExplore).toHaveBeenCalledOnce()
  expect(props.onSearchArea).not.toHaveBeenCalled()
})

it('does not enter exploration during automatic initial fitting', () => {
  render(<MapViewport {...props} />)
  sdk.zoom = 15
  fireEvent.wheel(screen.getByText('이동 idle'))
  fireEvent.click(screen.getByText('이동 idle'))
  expect(props.onExplore).not.toHaveBeenCalled()
})
afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
  vi.clearAllMocks()
})

it('does not search on idle, and submits the latest bounds only after a click', () => {
  render(<MapViewport {...props} />)
  fireEvent.click(screen.getByText('초기 idle'))
  expect(
    screen.queryByRole('button', { name: '현재 위치에서 검색' }),
  ).not.toBeInTheDocument()
  fireEvent.click(screen.getByText('이동 idle'))
  expect(
    screen.queryByRole('button', { name: '현재 위치에서 검색' }),
  ).not.toBeInTheDocument()
  fireEvent.wheel(screen.getByText('초기 idle'))
  fireEvent.click(screen.getByText('초기 idle'))
  expect(props.onSearchArea).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: '현재 위치에서 검색' }))
  expect(props.onSearchArea).toHaveBeenCalledExactlyOnceWith({
    north: 36,
    south: 35,
    west: 139,
    east: 140,
  })
  expect(
    screen.queryByRole('button', { name: '현재 위치에서 검색' }),
  ).not.toBeInTheDocument()
})

it('offers viewport search without a category after user movement', () => {
  render(<MapViewport {...props} />)
  fireEvent.click(screen.getByText('초기 idle'))
  fireEvent.wheel(screen.getByText('이동 idle'))
  fireEvent.click(screen.getByText('이동 idle'))
  expect(
    screen.queryByRole('button', { name: /(?:현재 위치|현 지도)에서 검색/ }),
  ).toBeInTheDocument()
})

it('uses the restored initial scale and preserves keyword results at that scale', () => {
  const view = render(
    <MapViewport
      {...props}
      zoomed
      cameraRequest={{
        center: { lat: 35.5, lng: 139.5 },
        zoom: 15,
        minZoom: 10.5,
        bounds: { north: 36, south: 35, west: 139, east: 140 },
      }}
    />,
  )
  fireEvent.click(screen.getByText('초기 idle'))
  sdk.zoom = 11
  fireEvent.wheel(screen.getByText('이동 idle'))
  fireEvent.click(screen.getByText('이동 idle'))
  expect(props.onOverview).not.toHaveBeenCalled()
  sdk.zoom = 10.5
  fireEvent.wheel(screen.getByText('이동 idle'))
  fireEvent.click(screen.getByText('이동 idle'))
  expect(props.onOverview).toHaveBeenCalledOnce()
  view.rerender(<MapViewport {...props} zoomed hasConditions />)
  fireEvent.wheel(screen.getByText('이동 idle'))
  fireEvent.click(screen.getByText('이동 idle'))
  expect(props.onOverview).toHaveBeenCalledOnce()
})

it('shows a configuration error without trying to render a map when the key is absent', () => {
  vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', '')
  render(<MapViewport {...props} />)
  expect(screen.getByRole('alert')).toHaveTextContent('지도 설정')
  expect(screen.queryByText('초기 idle')).not.toBeInTheDocument()
})

it.each(['FAILED', 'AUTH_FAILURE'])(
  'offers retry for SDK status %s',
  (status) => {
    sdk.status = status
    render(<MapViewport {...props} />)
    expect(screen.getByRole('alert')).toHaveTextContent(
      '지도를 불러오지 못했어요',
    )
    expect(screen.getByRole('button', { name: '다시 시도하기' })).toBeVisible()
  },
)

it('announces loading rather than rendering a fake map while the SDK loads', () => {
  sdk.status = 'LOADING'
  render(<MapViewport {...props} />)
  expect(screen.getByRole('status')).toHaveTextContent('지도를 불러오고 있어요')
})

it('handles Google authentication rejection after the SDK has already loaded', () => {
  const authWindow = window as Window & { gm_authFailure?: () => void }
  render(<MapViewport {...props} />)
  fireEvent.click(screen.getByText('초기 idle'))
  act(() => authWindow.gm_authFailure?.())
  expect(screen.getByRole('alert')).toHaveTextContent(
    '지도를 불러오지 못했어요',
  )
})

it('does not offer another search when a gesture leaves the bounds unchanged', () => {
  render(<MapViewport {...props} />)
  fireEvent.click(screen.getByText('초기 idle'))
  fireEvent.wheel(screen.getByText('초기 idle'))
  fireEvent.click(screen.getByText('초기 idle'))
  expect(
    screen.queryByRole('button', { name: '현재 위치에서 검색' }),
  ).not.toBeInTheDocument()
  fireEvent.click(screen.getByText('이동 idle'))
  expect(
    screen.queryByRole('button', { name: '현재 위치에서 검색' }),
  ).not.toBeInTheDocument()
})

it('offers recovery when SDK loading times out', () => {
  vi.useFakeTimers()
  try {
    sdk.status = 'LOADING'
    render(<MapViewport {...props} />)
    act(() => vi.advanceTimersByTime(15000))
    expect(screen.getByRole('alert')).toBeVisible()
    expect(screen.getByRole('button', { name: '다시 시도하기' })).toBeVisible()
  } finally {
    vi.useRealTimers()
  }
})

it('does not treat a stationary background tap followed by resizing as a search gesture', () => {
  render(<MapViewport {...props} />)
  fireEvent.click(screen.getByText('초기 idle'))
  fireEvent.pointerDown(screen.getByText('초기 idle').parentElement!)
  fireEvent.click(screen.getByText('이동 idle'))
  expect(
    screen.queryByRole('button', { name: '현재 위치에서 검색' }),
  ).not.toBeInTheDocument()
})
