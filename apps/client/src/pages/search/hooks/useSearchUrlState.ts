import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import type { SearchRestaurantsParams } from '@/pages/search/types'
import {
  createSearchUrlParams,
  parseSearchUrlState,
} from '@/pages/search/utils/searchUrlState'

export const useSearchUrlState = () => {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams()
  const appliedSearchState = useMemo(
    () => parseSearchUrlState(urlSearchParams),
    [urlSearchParams],
  )
  const { category, keyword, sort } = appliedSearchState
  const searchParams = keyword ? appliedSearchState : null

  const updateSearchUrlState = useCallback(
    (nextState: Partial<SearchRestaurantsParams>) => {
      setUrlSearchParams(
        createSearchUrlParams({
          category,
          keyword,
          sort,
          ...nextState,
        }),
        { replace: true },
      )
    },
    [category, keyword, setUrlSearchParams, sort],
  )

  return {
    category,
    keyword,
    searchParams,
    sort,
    updateSearchUrlState,
  }
}
