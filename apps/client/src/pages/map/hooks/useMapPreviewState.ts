import { useState } from 'react'

import {
  MAP_PREVIEW_AREAS,
  MAP_PREVIEW_RESTAURANTS,
} from '@/pages/map/data/mapPreviewRestaurants'
import type { MapBounds, MapConditions } from '@/pages/map/types'
import { filterMapRestaurants } from '@/pages/map/utils/filterMapRestaurants'
import { getMapAreaMarkers } from '@/pages/map/utils/getMapAreaMarkers'

const AREA_MARKERS = getMapAreaMarkers(
  MAP_PREVIEW_AREAS,
  MAP_PREVIEW_RESTAURANTS,
)

const INITIAL_CONDITIONS: MapConditions = {
  keyword: '',
  category: 'all',
  areaCode: null,
  sort: 'recommended',
}

export const useMapPreviewState = () => {
  const [draft, setDraft] = useState('')
  const [conditions, setConditions] = useState(INITIAL_CONDITIONS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchBounds, setSearchBounds] = useState<MapBounds | null>(null)
  const [resetVersion, setResetVersion] = useState(0)
  const [isExploring, setIsExploring] = useState(false)
  const restaurants = filterMapRestaurants(
    MAP_PREVIEW_RESTAURANTS,
    conditions,
    searchBounds,
  )
  const selectedRestaurant =
    MAP_PREVIEW_RESTAURANTS.find(({ id }) => id === selectedId) ?? null

  const handleConditionsChange = (patch: Partial<MapConditions>) => {
    if (patch.areaCode || patch.category || patch.keyword !== undefined)
      setIsExploring(true)
    if (patch.areaCode) setSearchBounds(null)
    setConditions((current) => ({ ...current, ...patch }))
    setSelectedId(null)
  }
  const handleReset = () => {
    setDraft('')
    setConditions(INITIAL_CONDITIONS)
    setSelectedId(null)
    setSearchBounds(null)
    setResetVersion((version) => version + 1)
    setIsExploring(false)
  }

  const handleSearchArea = (bounds: MapBounds) => {
    setIsExploring(true)
    setSearchBounds(bounds)
    setConditions((current) => ({ ...current, areaCode: null }))
    setSelectedId(null)
  }

  return {
    draft,
    setDraft,
    conditions,
    restaurants,
    areas: AREA_MARKERS,
    selectedRestaurant,
    setSelectedId,
    handleConditionsChange,
    handleReset,
    searchBounds,
    resetVersion,
    handleSearchArea,
    isExploring,
    handleExplore: () => setIsExploring(true),
    handleSelectRestaurant: (id: string) => {
      setIsExploring(true)
      setSelectedId(id)
    },
  }
}
