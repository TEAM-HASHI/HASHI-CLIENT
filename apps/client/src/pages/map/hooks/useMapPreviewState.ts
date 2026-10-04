import { useState } from 'react'

import { MAP_PREVIEW_RESTAURANTS } from '@/pages/map/data/mapPreviewRestaurants'
import type { MapConditions } from '@/pages/map/types'
import { filterMapRestaurants } from '@/pages/map/utils/filterMapRestaurants'

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
  const restaurants = filterMapRestaurants(MAP_PREVIEW_RESTAURANTS, conditions)
  const selectedRestaurant =
    MAP_PREVIEW_RESTAURANTS.find(({ id }) => id === selectedId) ?? null

  const handleConditionsChange = (patch: Partial<MapConditions>) => {
    setConditions((current) => ({ ...current, ...patch }))
    setSelectedId(null)
  }
  const handleReset = () => {
    setDraft('')
    setConditions(INITIAL_CONDITIONS)
    setSelectedId(null)
  }

  return {
    draft,
    setDraft,
    conditions,
    restaurants,
    selectedRestaurant,
    setSelectedId,
    handleConditionsChange,
    handleReset,
  }
}
