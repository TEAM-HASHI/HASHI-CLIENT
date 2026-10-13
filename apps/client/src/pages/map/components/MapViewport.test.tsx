import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { MapViewport } from '@/pages/map/components/MapViewport'

const sdk = vi.hoisted(() => ({ status: 'LOADED', zoom: 12 }))
vi.mock('@vis.gl/react-google-maps', () => ({
  APIProvider: ({ children }: PropsWithChildren) => children,
  APILoadingStatus: {
    LOADED: 'LOADED',
    FAILED: 'FAILED',
    AUTH_FAILURE: 'AUTH_FAILURE',
  },
  useApiLoadingStatus: () => sdk.status,
  useMap: () => null,
  AdvancedMarker: ({ children }: PropsWithChildren) => children,
  Map: ({
    children,
    onIdle,
    onZoomChanged,
  }: PropsWithChildren<{
    onIdle: (event: unknown) => void
    onZoomChanged?: () => void
  }>) => (
    <div onWheel={onZoomChanged}>
      <button onClick={onZoomChanged}>자동 zoom</button>
      <button
        onClick={() =>
          onIdle({
            map: {
              getZoom: () => 11,
              getCenter: () => ({ toJSON: () => ({ lat: 35.5, lng: 139.5 }) }),
              getBounds: () => ({
                toJSON: () => ({ north: 36, south: 35, west: 139, east: 140 }),
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
              getCenter: () => ({ toJSON: () => ({ lat: 36.5, lng: 140.5 }) }),
              getBounds: () => ({
                toJSON: () => ({ north: 37, south: 36, west: 140, east: 141 }),
              }),
            },
          })
        }
      >
        이동 idle
      </button>
      {children}
    </div>
  ),
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
beforeEach(() => {
  vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'test-key')
  vi.stubEnv('VITE_GOOGLE_MAPS_MAP_ID', 'DEMO_MAP_ID')
  sdk.status = 'LOADED'
  sdk.zoom = 12
})

it('restores region mode when the user zooms back out without conditions', () => {
  render(<MapViewport {...props} zoomed />)
  fireEvent.click(screen.getByText('초기 idle'))
  sdk.zoom = 13
  fireEvent.wheel(screen.getByText('이동 idle'))
  fireEvent.click(screen.getByText('이동 idle'))
  expect(props.onOverview).toHaveBeenCalledOnce()
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
  })
  fireEvent.wheel(screen.getByText('이동 idle'))
  expect(onUserMove).toHaveBeenCalledOnce()
})

it('enters exploration only after user zoom reaches the neighborhood threshold', () => {
  render(<MapViewport {...props} />)
  fireEvent.click(screen.getByText('초기 idle'))
  sdk.zoom = 13.9
  fireEvent.wheel(screen.getByText('이동 idle'))
  fireEvent.click(screen.getByText('이동 idle'))
  expect(props.onExplore).not.toHaveBeenCalled()
  sdk.zoom = 14
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
  render(<MapViewport {...props} hasCategory />)
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

it('does not offer viewport search without a category even after user movement', () => {
  render(<MapViewport {...props} />)
  fireEvent.click(screen.getByText('초기 idle'))
  fireEvent.wheel(screen.getByText('이동 idle'))
  fireEvent.click(screen.getByText('이동 idle'))
  expect(
    screen.queryByRole('button', { name: /(?:현재 위치|현 지도)에서 검색/ }),
  ).not.toBeInTheDocument()
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
