import { act, renderHook } from '@testing-library/react'
import { expect, it } from 'vitest'

import { useMapPreviewState } from '@/pages/map/hooks/useMapPreviewState'

it('applies bounds only on search, clears stale area/selection and resets to overview', () => {
  const { result } = renderHook(() => useMapPreviewState())
  expect(result.current.restaurants).toHaveLength(7)
  act(() => result.current.handleConditionsChange({ areaCode: 'shinjuku' }))
  act(() => result.current.setSelectedId('preview-tonkatsu'))
  act(() =>
    result.current.handleSearchArea({ south: 0, north: 1, west: 0, east: 1 }),
  )
  expect(result.current.restaurants).toEqual([])
  expect(result.current.conditions.areaCode).toBeNull()
  expect(result.current.selectedRestaurant).toBeNull()
  act(() => result.current.handleReset())
  expect(result.current.restaurants).toHaveLength(7)
  expect(result.current.searchBounds).toBeNull()
})

it('keeps individual pins after entering exploration until an explicit reset', () => {
  const { result } = renderHook(() => useMapPreviewState())
  expect(result.current.isExploring).toBe(false)
  act(() => result.current.handleConditionsChange({ category: 'cafe' }))
  act(() => result.current.handleConditionsChange({ category: 'all' }))
  expect(result.current.isExploring).toBe(true)
  act(() => result.current.handleReset())
  expect(result.current.isExploring).toBe(false)
})

it('enters exploration without changing results and resets only explicitly', () => {
  const { result, rerender } = renderHook(() => useMapPreviewState())
  const initialRestaurants = result.current.restaurants
  act(() => result.current.handleExplore())
  rerender()
  expect(result.current.isExploring).toBe(true)
  expect(result.current.restaurants).toEqual(initialRestaurants)
  expect(result.current.searchBounds).toBeNull()
  act(() => result.current.handleReset())
  expect(result.current.isExploring).toBe(false)
})
