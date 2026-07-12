import { showToast } from '@hashi/hds-ui'
import { QueryClient } from '@tanstack/react-query'

import { getErrorPresentation } from '@/shared/api/errorPresentation'
import {
  checkShouldRetryQuery,
  checkShouldThrowQueryError,
} from '@/shared/api/errorPolicy'
import { captureError } from '@/shared/lib/sentry'

const handleMutationError = (error: Error) => {
  captureError(error)

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
