import { normalizeMapQuery } from '@/pages/map/api/mapApiAdapters'
import type { MapPageRequest } from '@/pages/map/api/mapApiTypes'

const NEW_QUERY_KEYS = [
  'south',
  'north',
  'west',
  'east',
  'sort',
  'mapRegionId',
  'keyword',
  'genre',
  'placeType',
]

export const serializeMapRequest = (
  params: MapPageRequest,
): Record<string, string | number> => {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined,
  )
  const input = Object.fromEntries(entries)
  const allowedKeys =
    'cursor' in input
      ? ['cursor']
      : 'querySessionId' in input
        ? ['querySessionId', 'sort']
        : NEW_QUERY_KEYS
  if (entries.some(([key]) => !allowedKeys.includes(key)))
    throw new Error(
      'Invalid map request: mixed modes or unsupported parameters',
    )
  if ('cursor' in input) {
    if (typeof input.cursor !== 'string' || !input.cursor.trim())
      throw new Error('Invalid map request: cursor')
    return { cursor: input.cursor }
  }
  if ('querySessionId' in input) {
    if (
      typeof input.querySessionId !== 'string' ||
      !input.querySessionId.trim() ||
      !['recommend', 'rating', 'reviews'].includes(String(input.sort))
    )
      throw new Error('Invalid map request: session sort')
    return { querySessionId: input.querySessionId, sort: input.sort as string }
  }
  try {
    return {
      ...normalizeMapQuery({
        ...input,
        keyword:
          typeof input.keyword === 'string'
            ? input.keyword.trim() || undefined
            : input.keyword,
        placeType: input.placeType === 'all' ? undefined : input.placeType,
      }),
    }
  } catch (cause) {
    throw new Error('Invalid map request: new query', { cause })
  }
}
