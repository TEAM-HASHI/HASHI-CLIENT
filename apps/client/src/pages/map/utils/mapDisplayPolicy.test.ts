import { expect, it } from 'vitest'
import { getMapDisplayMode } from '@/pages/map/utils/mapDisplayPolicy'

it.each([
  [10.5, 'restaurants', false, 'areas'],
  [11.5, 'areas', false, 'restaurants'],
  [11, 'areas', false, 'areas'],
  [11, 'restaurants', false, 'restaurants'],
  [11, 'areas', true, 'restaurants'],
] as const)(
  'at zoom %s from %s with conditions %s displays %s',
  (zoom, previous, hasConditions, expected) => {
    expect(
      getMapDisplayMode({ zoom, previous, hasConditions, overviewZoom: 10.5 }),
    ).toBe(expected)
  },
)
