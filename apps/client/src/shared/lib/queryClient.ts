import { showToast } from '@hashi/hds-ui'
import * as Sentry from '@sentry/react'
import { QueryClient } from '@tanstack/react-query'

import { getErrorPresentation } from '@/shared/api/errorPresentation'
import {
  checkIsExpectedRequestError,
  checkShouldRetryQuery,
  checkShouldThrowQueryError,
} from '@/shared/api/errorPolicy'

const handleMutationError = (error: Error) => {
  if (!checkIsExpectedRequestError(error)) {
    Sentry.captureException(error)
  }

  const { message } = getErrorPresentation(error)
  showToast({ children: message })
}

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 10 * 60 * 1_000,
        refetchOnWindowFocus: false,
        retry: checkShouldRetryQuery,
        staleTime: 30_000,
        throwOnError: checkShouldThrowQueryError,
      },
      mutations: {
        onError: handleMutationError,
        retry: false,
        throwOnError: false,
      },
    },
  })

export const queryClient = createQueryClient()
