import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useGoogleMapCamera } from '@/pages/map/hooks/useGoogleMapCamera'

const initialBounds = { north: 35.9, south: 35.5, east: 139.95, west: 139.4 }
const areaBounds = { north: 35.74, south: 35.68, east: 139.8, west: 139.72 }
const areas = [
  {
    code: 'a',
    name: 'A',
    restaurantCount: 1,
    position: { lat: 35.71, lng: 139.76 },
    cameraBounds: areaBounds,
  },
]

const sdk = vi.hoisted(() => ({
  idle: () => {},
  zoom: 11.75,
  width: 430,
  height: 652,
  map: {
    getDiv: () => ({ clientWidth: sdk.width, clientHeight: sdk.height }),
    fitBounds: vi.fn(),
    moveCamera: vi.fn(),
    panTo: vi.fn(),
    setZoom: vi.fn((zoom: number) => {
      sdk.zoom = zoom
    }),
    getZoom: () => sdk.zoom,
    setOptions: vi.fn(),
    addListener: vi.fn((_name: string, fn: () => void) => {
      sdk.idle = fn
      return { remove: vi.fn() }
    }),
  },
}))
vi.mock('@vis.gl/react-google-maps', () => ({ useMap: () => sdk.map }))

beforeEach(() => {
  sdk.zoom = 11.75
  sdk.width = 430
  sdk.height = 652
  vi.clearAllMocks()
})

it('leaves usable fitting space on the 430×303 map that reproduced the distant overview', () => {
  sdk.height = 303
  renderHook(() =>
    useGoogleMapCamera(
      areas,
      undefined,
      undefined,
      0,
      null,
      null,
      initialBounds,
    ),
  )
  const padding = sdk.map.fitBounds.mock.calls[0][1] as {
    top: number
    bottom: number
  }
  expect(sdk.height - padding.top - padding.bottom).toBeGreaterThanOrEqual(150)
  expect(padding.top).toBeGreaterThan(padding.bottom)
})
afterEach(cleanup)

it('defers initial fitting while the list covers the map and never refits after calibration', () => {
  const { rerender } = renderHook(
    ({ enabled }) =>
      useGoogleMapCamera(
        areas,
        undefined,
        undefined,
        0,
        null,
        null,
        initialBounds,
        undefined,
        enabled,
      ),
    { initialProps: { enabled: false } },
  )
  expect(sdk.map.fitBounds).not.toHaveBeenCalled()
  rerender({ enabled: true })
  expect(sdk.map.fitBounds).toHaveBeenCalledTimes(1)
  act(() => sdk.idle())
  rerender({ enabled: false })
  rerender({ enabled: true })
  expect(sdk.map.fitBounds).toHaveBeenCalledTimes(1)
})

it('fits server initial bounds rather than the extrema of region markers', () => {
  renderHook(() =>
    useGoogleMapCamera(
      areas,
      undefined,
      undefined,
      0,
      null,
      null,
      initialBounds,
    ),
  )
  expect(sdk.map.fitBounds).toHaveBeenCalledExactlyOnceWith(initialBounds, {
    top: 170,
    bottom: 64,
    left: 60,
    right: 60,
  })
})

it('fits server initial bounds even when no region markers were returned', () => {
  renderHook(() =>
    useGoogleMapCamera([], undefined, undefined, 0, null, null, initialBounds),
  )
  expect(sdk.map.fitBounds).toHaveBeenCalledWith(
    initialBounds,
    expect.anything(),
  )
  act(() => sdk.idle())
  expect(sdk.map.setOptions).toHaveBeenCalledWith({ minZoom: 11.75 })
})

it('waits for the overview before fitting a selected region and preserves its minimum zoom', () => {
  const { result } = renderHook(() =>
    useGoogleMapCamera(
      areas,
      areas[0].position,
      undefined,
      0,
      null,
      null,
      initialBounds,
      areaBounds,
    ),
  )
  expect(sdk.map.fitBounds).toHaveBeenCalledTimes(1)
  act(() => sdk.idle())
  expect(sdk.map.fitBounds).toHaveBeenLastCalledWith(areaBounds, {
    top: 140,
    bottom: 64,
    left: 40,
    right: 40,
  })
  expect(sdk.map.moveCamera).not.toHaveBeenCalled()
  expect(result.current.minimumZoom.current).toBe(11.75)
  sdk.zoom = 15
  act(() => sdk.idle())
  expect(sdk.map.setOptions).toHaveBeenCalledExactlyOnceWith({ minZoom: 11.75 })
  expect(result.current.programmaticMove.current).toBe(true)
  expect(result.current.userMoved.current).toBe(false)
})

it('does not reset the camera when server region counts refresh with unchanged bounds', () => {
  const { rerender } = renderHook(
    ({ count }) =>
      useGoogleMapCamera(
        [{ ...areas[0], restaurantCount: count }],
        undefined,
        undefined,
        0,
        null,
        null,
        { ...initialBounds },
      ),
    { initialProps: { count: 1 } },
  )
  act(() => sdk.idle())
  rerender({ count: 2 })
  expect(sdk.map.fitBounds).toHaveBeenCalledTimes(1)
})

it('preserves the original minimum zoom when restoring into a taller viewport', () => {
  sdk.zoom = 13
  const snapshot = {
    center: { lat: 35.71, lng: 139.71 },
    zoom: 12,
    minZoom: 11.75,
    bounds: { north: 36, south: 35, west: 139, east: 140 },
  }
  const areas = [
    { code: 'a', name: 'A', restaurantCount: 1, position: snapshot.center },
  ]
  renderHook(() => useGoogleMapCamera(areas, undefined, undefined, 0, snapshot))
  act(() => sdk.idle())
  expect(sdk.map.setOptions).toHaveBeenCalledWith({ minZoom: 11.75 })
  expect(sdk.map.moveCamera).toHaveBeenCalledWith({
    center: snapshot.center,
    zoom: 12,
  })
})

it.each([0, 1, 2])(
  'handles %i search result positions without inventing coordinates',
  (count) => {
    const points = [
      { lat: 35.7, lng: 139.7 },
      { lat: 35.8, lng: 139.8 },
    ].slice(0, count)
    const areas = [
      {
        code: 'a',
        name: 'A',
        restaurantCount: 1,
        position: { lat: 35.7, lng: 139.7 },
      },
    ]
    renderHook(() =>
      useGoogleMapCamera(areas, undefined, undefined, 0, null, points),
    )
    act(() => sdk.idle())
    if (count === 0) expect(sdk.map.moveCamera).not.toHaveBeenCalled()
    if (count === 1)
      expect(sdk.map.moveCamera).toHaveBeenCalledWith({
        center: points[0],
        zoom: 15,
      })
    expect(sdk.map.fitBounds).toHaveBeenCalledTimes(count > 1 ? 2 : 1)
  },
)

it('waits for initial fitting before restoring a requested camera', () => {
  const snapshot = {
    center: { lat: 35.71, lng: 139.71 },
    zoom: 14,
    bounds: { north: 36, south: 35, west: 139, east: 140 },
  }
  const areas = [
    { code: 'a', name: 'A', restaurantCount: 1, position: snapshot.center },
  ]
  renderHook(() => useGoogleMapCamera(areas, undefined, undefined, 0, snapshot))
  expect(sdk.map.moveCamera).not.toHaveBeenCalled()
  act(() => sdk.idle())
  expect(sdk.map.moveCamera).toHaveBeenCalledWith({
    center: snapshot.center,
    zoom: 14,
  })
  expect(sdk.map.setOptions).toHaveBeenCalledWith({ minZoom: 11.75 })
})

it('locks zoom-out to the fitted overview, not a fixed distant zoom', () => {
  renderHook(() =>
    useGoogleMapCamera(
      [
        {
          code: 'a',
          name: 'A',
          restaurantCount: 1,
          position: { lat: 35.7, lng: 139.7 },
        },
      ],
      undefined,
      undefined,
      0,
    ),
  )
  act(() => sdk.idle())
  expect(sdk.map.setOptions).toHaveBeenCalledWith({ minZoom: 11.75 })
})

it('finishes the overview before applying a restaurant selected while the SDK loads', () => {
  renderHook(() =>
    useGoogleMapCamera(
      [
        {
          code: 'a',
          name: 'A',
          restaurantCount: 1,
          position: { lat: 35.7, lng: 139.7 },
        },
      ],
      undefined,
      { lat: 35.71, lng: 139.71 },
      0,
    ),
  )
  expect(sdk.map.setZoom).not.toHaveBeenCalled()
  act(() => sdk.idle())
  expect(sdk.map.setOptions).toHaveBeenCalledWith({ minZoom: 11.75 })
  expect(sdk.map.setZoom).toHaveBeenCalledWith(15)
})
