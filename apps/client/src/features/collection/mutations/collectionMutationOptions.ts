import { mutationOptions, type QueryClient } from '@tanstack/react-query'

import { getAuthSessionVersion } from '@/shared/auth/authSession'
import {
  assertCollectionSession,
  runWithCollectionSession,
} from '@/features/collection/utils/collectionSession'

export const collectionMutationOptions = <TData, TVariables>(
  queryClient: QueryClient,
  mutationFn: (variables: TVariables) => Promise<TData>,
  synchronize: (
    data: TData,
    variables: TVariables,
    sessionVersion: number,
  ) => Promise<void>,
  onError?: (error: Error) => void,
) => {
  const sessionVersion = getAuthSessionVersion()
  return mutationOptions({
    onMutate: () => {
      assertCollectionSession(sessionVersion)
      return sessionVersion
    },
    mutationFn: (variables: TVariables) =>
      runWithCollectionSession(sessionVersion, () => mutationFn(variables)),
    onSuccess: (data, variables, version) =>
      runWithCollectionSession(version, () =>
        synchronize(data, variables, version),
      ),
    onError: (error: Error, variables, version, context) => {
      if (version !== getAuthSessionVersion()) return
      if (onError) onError(error)
      else
        queryClient
          .getDefaultOptions()
          .mutations?.onError?.(error, variables, version, context)
    },
  })
}
