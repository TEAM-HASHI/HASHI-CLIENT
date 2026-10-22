import { expect, it } from 'vitest'
import { parseMapSearchContext } from '@/features/mapSearch/utils/parseMapSearchContext'
it('accepts only a map source and a valid keyword', () => {
  expect(parseMapSearchContext({ source: 'map', keyword: ' sushi ' })).toEqual({
    source: 'map',
    keyword: 'sushi',
  })
  for (const value of [
    null,
    undefined,
    [],
    'map',
    { source: 'map' },
    { source: 'search', keyword: '' },
    { source: 'map', keyword: 12 },
  ])
    expect(parseMapSearchContext(value)).toBeNull()
})
