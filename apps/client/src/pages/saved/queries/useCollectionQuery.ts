import { queryOptions, useQuery } from '@tanstack/react-query'

import { getCollection } from '@/pages/saved/api/getCollection'
import { isValidCollectionId } from '@/pages/saved/api/collectionReadContracts'
import { collectionQueryKeys } from '@/pages/saved/queries/collectionQueryKeys'

export const collectionQueryOptions = (
  collectionId: number | null,
  publicView = false,
) =>
  queryOptions({
    queryKey: collectionQueryKeys.detail(collectionId, publicView),
    queryFn: ({ signal }) => {
      if (!isValidCollectionId(collectionId))
        throw new Error('A valid collectionId is required')
      return getCollection(collectionId, signal)
    },
    enabled: isValidCollectionId(collectionId),
    ...(publicView && { gcTime: 0 }),
    throwOnError: false,
  })

export const useCollectionQuery = (
  collectionId: number | null,
  publicView = false,
) => useQuery(collectionQueryOptions(collectionId, publicView))
