import { QueryClient } from '@tanstack/react-query'
import { isNetworkError, isTimeoutError } from 'ky'

import { checkIsRetryableApiError } from '@/shared/api/apiError'

const MAX_QUERY_RETRY_COUNT = 1

const checkShouldRetryQuery = (failureCount: number, error: Error) => {
  if (failureCount >= MAX_QUERY_RETRY_COUNT) {
    return false
  }

  if (checkIsRetryableApiError(error)) {
    return true
  }

  return isNetworkError(error) || isTimeoutError(error)
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 10 * 60 * 1_000,
      refetchOnWindowFocus: false,
      retry: checkShouldRetryQuery,
      staleTime: 30_000,
    },
    mutations: {
      retry: false,
    },
  },
})
