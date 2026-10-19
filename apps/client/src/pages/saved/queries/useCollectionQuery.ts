import { queryOptions, useQuery } from '@tanstack/react-query'

import { getCollection } from '@/pages/saved/api/getCollection'
import { isValidCollectionId } from '@/pages/saved/api/collectionReadContracts'
import { collectionQueryKeys } from '@/pages/saved/queries/collectionQueryKeys'

export const collectionQueryOptions = (collectionId: number | null) =>
  queryOptions({
    queryKey: collectionQueryKeys.detail(collectionId),
    queryFn: ({ signal }) => {
      if (!isValidCollectionId(collectionId))
        throw new Error('A valid collectionId is required')
      return getCollection(collectionId, signal)
    },
    enabled: isValidCollectionId(collectionId),
    throwOnError: false,
  })

export const useCollectionQuery = (collectionId: number | null) =>
  useQuery(collectionQueryOptions(collectionId))
