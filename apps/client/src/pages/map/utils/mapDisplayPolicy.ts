type MapDisplayMode = 'areas' | 'restaurants'

export const getMapDisplayMode = ({
  zoom,
  previous,
  hasConditions,
}: {
  zoom: number
  previous: MapDisplayMode
  hasConditions: boolean
}): MapDisplayMode => {
  if (hasConditions || zoom >= 14) return 'restaurants'
  if (zoom <= 13) return 'areas'
  return previous
}
