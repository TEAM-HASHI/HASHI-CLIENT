import { collectionMutationOptions } from '@/pages/saved/mutations/collectionMutationOptions'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createCollection } from '@/pages/saved/api/createCollection'
import { updateCollection } from '@/pages/saved/api/updateCollection'
import type { UpdateCollectionBody } from '@/pages/saved/api/updateCollection'
import { synchronizeCollectionHeader } from '@/pages/saved/mutations/synchronizeCollectionHeader'
import { collectionQueryKeys } from '@/pages/saved/queries/collectionQueryKeys'

export const useCreateCollectionMutation = (
  onError?: (error: Error) => void,
) => {
  const queryClient = useQueryClient()
  return useMutation(
    collectionMutationOptions(
      queryClient,
      createCollection,
      async (detail, _variables, sessionVersion) => {
        await synchronizeCollectionHeader(queryClient, detail, sessionVersion)
        await queryClient.invalidateQueries({
          queryKey: collectionQueryKeys.lists(sessionVersion),
        })
      },
      onError,
    ),
  )
}

export const useUpdateCollectionMutation = (
  onError?: (error: Error) => void,
) => {
  const queryClient = useQueryClient()
  return useMutation(
    collectionMutationOptions(
      queryClient,
      ({
        collectionId,
        body,
      }: {
        collectionId: number
        body: UpdateCollectionBody
      }) => updateCollection(collectionId, body),
      async (detail, _variables, sessionVersion) => {
        await synchronizeCollectionHeader(queryClient, detail, sessionVersion)
        await queryClient.invalidateQueries({
          queryKey: collectionQueryKeys.lists(sessionVersion),
        })
      },
      onError,
    ),
  )
}
