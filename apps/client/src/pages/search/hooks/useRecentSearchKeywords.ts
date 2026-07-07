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

  try {
    return parseRecentSearchKeywords(
      window.localStorage.getItem(RECENT_SEARCH_KEYWORDS_STORAGE_KEY),
    )
  } catch {
    return []
  }
}

const setStoredRecentSearchKeywords = (keywords: string[]) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(
      RECENT_SEARCH_KEYWORDS_STORAGE_KEY,
      JSON.stringify(keywords),
    )
  } catch {
    // Recent keywords are a convenience feature; storage failures should not block search.
  }
}

export const useRecentSearchKeywords = () => {
  const [recentSearchKeywords, setRecentSearchKeywords] = useState<string[]>(
    () => getStoredRecentSearchKeywords(),
  )

  const saveRecentSearchKeyword = useCallback((keyword: string) => {
    const normalizedKeyword = keyword.trim()

    if (!normalizedKeyword) {
      return
    }

    setRecentSearchKeywords((currentKeywords) => {
      const nextKeywords = [
        normalizedKeyword,
        ...currentKeywords.filter((value) => value !== normalizedKeyword),
      ].slice(0, MAX_RECENT_SEARCH_KEYWORD_COUNT)

      setStoredRecentSearchKeywords(nextKeywords)

      return nextKeywords
    })
  }, [])

  return {
    recentSearchKeywords,
    saveRecentSearchKeyword,
  }
}
