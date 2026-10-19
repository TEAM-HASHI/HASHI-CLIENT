import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createCollection } from '@/pages/saved/api/createCollection'
import { updateCollection } from '@/pages/saved/api/updateCollection'
import type { UpdateCollectionBody } from '@/pages/saved/api/updateCollection'
import { synchronizeCollectionHeader } from '@/pages/saved/mutations/synchronizeCollectionHeader'
import { collectionQueryKeys } from '@/pages/saved/queries/collectionQueryKeys'

export const useCreateCollectionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCollection,
    onSuccess: async (detail) => {
      await synchronizeCollectionHeader(queryClient, detail)
      await queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.lists(),
      })
    },
  })
}

export const useUpdateCollectionMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      collectionId,
      body,
    }: {
      collectionId: number
      body: UpdateCollectionBody
    }) => updateCollection(collectionId, body),
    onSuccess: async (detail) => {
      await synchronizeCollectionHeader(queryClient, detail)
      await queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.lists(),
      })
    },
  })
}
