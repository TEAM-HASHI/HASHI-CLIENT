import { useCallback, useState } from 'react'

import {
  MAX_RECENT_SEARCH_KEYWORD_COUNT,
  RECENT_SEARCH_KEYWORDS_STORAGE_KEY,
} from '@/pages/search/constants/searchFilters'

const parseRecentSearchKeywords = (storedValue: string | null) => {
  if (!storedValue) {
    return []
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.filter((value): value is string => {
      return typeof value === 'string' && value.trim().length > 0
    })
  } catch {
    return []
  }
}

const getStoredRecentSearchKeywords = () => {
  if (typeof window === 'undefined') {
    return []
  }

  return parseRecentSearchKeywords(
    window.localStorage.getItem(RECENT_SEARCH_KEYWORDS_STORAGE_KEY),
  )
}

export const useRecentSearchKeywords = () => {
  const [recentSearchKeywords, setRecentSearchKeywords] = useState<string[]>(
    () => getStoredRecentSearchKeywords(),
  )

  const saveRecentSearchKeyword = useCallback((keyword: string) => {
    const normalizedKeyword = keyword.trim()

    if (!normalizedKeyword || typeof window === 'undefined') {
      return
    }

    setRecentSearchKeywords((currentKeywords) => {
      const nextKeywords = [
        normalizedKeyword,
        ...currentKeywords.filter((value) => value !== normalizedKeyword),
      ].slice(0, MAX_RECENT_SEARCH_KEYWORD_COUNT)

      window.localStorage.setItem(
        RECENT_SEARCH_KEYWORDS_STORAGE_KEY,
        JSON.stringify(nextKeywords),
      )

      return nextKeywords
    })
  }, [])

  return {
    recentSearchKeywords,
    saveRecentSearchKeyword,
  }
}
