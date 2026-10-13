import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useGoogleMapCamera } from '@/pages/map/hooks/useGoogleMapCamera'

const sdk = vi.hoisted(() => ({
  idle: () => {},
  zoom: 11.75,
  map: {
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
  vi.clearAllMocks()
})
afterEach(cleanup)

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
