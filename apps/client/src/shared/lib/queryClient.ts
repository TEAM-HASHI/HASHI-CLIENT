import { QueryClient } from '@tanstack/react-query'
import { isHTTPError, isNetworkError, isTimeoutError } from 'ky'

const MAX_QUERY_RETRY_COUNT = 1

const checkShouldRetryQuery = (failureCount: number, error: Error) => {
  if (failureCount >= MAX_QUERY_RETRY_COUNT) {
    return false
  }

  if (isHTTPError(error)) {
    return error.response.status >= 500
  }

  return isNetworkError(error) || isTimeoutError(error)
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: checkShouldRetryQuery,
      staleTime: 30_000,
    },
    mutations: {
      retry: false,
    },
  },
})
