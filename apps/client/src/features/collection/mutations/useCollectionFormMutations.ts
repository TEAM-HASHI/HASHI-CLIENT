import { collectionMutationOptions } from '@/features/collection/mutations/collectionMutationOptions'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createCollection } from '@/features/collection/api/createCollection'
import { updateCollection } from '@/features/collection/api/updateCollection'
import type { UpdateCollectionBody } from '@/features/collection/api/updateCollection'
import { synchronizeCollectionHeader } from '@/features/collection/mutations/synchronizeCollectionHeader'
import { collectionQueryKeys } from '@/features/collection/queries/collectionQueryKeys'

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
