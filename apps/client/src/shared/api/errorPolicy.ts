import { isNetworkError, isTimeoutError } from 'ky'

import { checkHasHttpStatus } from '@/shared/api/apiError'

const MAX_QUERY_RETRY_COUNT = 1

export const checkIsExpectedRequestError = (error: unknown) =>
  checkHasHttpStatus(error) || isNetworkError(error) || isTimeoutError(error)

export const checkShouldRetryQuery = (failureCount: number, error: Error) => {
  if (failureCount >= MAX_QUERY_RETRY_COUNT) {
    return false
  }

  if (checkHasHttpStatus(error)) {
    return error.status >= 500
  }

  return isNetworkError(error) || isTimeoutError(error)
}

export const checkShouldThrowQueryError = (error: Error) => {
  if (checkHasHttpStatus(error)) {
    return error.status >= 500
  }

  return true
}
