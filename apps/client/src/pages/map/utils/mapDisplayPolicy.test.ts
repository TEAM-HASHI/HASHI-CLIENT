import { expect, it } from 'vitest'
import { getMapDisplayMode } from '@/pages/map/utils/mapDisplayPolicy'

it.each([
  [13, 'restaurants', false, 'areas'],
  [14, 'areas', false, 'restaurants'],
  [13.5, 'areas', false, 'areas'],
  [13.5, 'restaurants', false, 'restaurants'],
  [11, 'areas', true, 'restaurants'],
] as const)(
  'at zoom %s from %s with conditions %s displays %s',
  (zoom, previous, hasConditions, expected) => {
    expect(getMapDisplayMode({ zoom, previous, hasConditions })).toBe(expected)
  },
)
