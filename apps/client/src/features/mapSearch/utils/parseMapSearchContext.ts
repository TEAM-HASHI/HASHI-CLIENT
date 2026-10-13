import type { MapSearchContext } from '@/features/mapSearch/types'
export const parseMapSearchContext = (
  value: unknown,
): MapSearchContext | null => {
  if (
    !value ||
    typeof value !== 'object' ||
    !('source' in value) ||
    value.source !== 'map' ||
    !('keyword' in value) ||
    typeof value.keyword !== 'string'
  )
    return null
  return { source: 'map', keyword: value.keyword.trim() }
}
