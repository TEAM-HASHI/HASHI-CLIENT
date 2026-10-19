import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

import type { CollectionDetailData } from '@/pages/saved/api/collectionApiTypes'
import { deleteCollection } from '@/pages/saved/api/deleteCollection'
import { moveSavedRestaurants } from '@/pages/saved/api/moveSavedRestaurants'
import type { MoveSavedRestaurantsBody } from '@/pages/saved/api/moveSavedRestaurants'
import { removeSavedRestaurants } from '@/pages/saved/api/removeSavedRestaurants'
import { saveRestaurant } from '@/pages/saved/api/saveRestaurant'
import type { SaveRestaurantBody } from '@/pages/saved/api/saveRestaurant'
import { synchronizeCollectionHeader } from '@/pages/saved/mutations/synchronizeCollectionHeader'
import { collectionQueryKeys } from '@/pages/saved/queries/collectionQueryKeys'

const synchronizeSavedCollections = async (
  queryClient: QueryClient,
  details: CollectionDetailData[],
) => {
  const ids = await Promise.all(
    details.map((detail) => synchronizeCollectionHeader(queryClient, detail)),
  )
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: collectionQueryKeys.lists() }),
    ...ids.map((id) =>
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.restaurantLists(id),
      }),
    ),
  ])
}

export const useSaveRestaurantMutation = (onError?: (error: Error) => void) => {
  const queryClient = useQueryClient()
  return useMutation({
    ...(onError && { onError: (error: Error) => onError(error) }),
    mutationFn: ({
      collectionId,
      body,
    }: {
      collectionId: number
      body: SaveRestaurantBody
    }) => saveRestaurant(collectionId, body),
    onSuccess: (detail) => synchronizeSavedCollections(queryClient, [detail]),
  })
}

export const useRemoveSavedRestaurantsMutation = (
  onError?: (error: Error) => void,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    ...(onError && { onError: (error: Error) => onError(error) }),
    mutationFn: ({
      collectionId,
      restaurantIds,
    }: {
      collectionId: number
      restaurantIds: readonly number[]
    }) => removeSavedRestaurants(collectionId, restaurantIds),
    onSuccess: (detail) => synchronizeSavedCollections(queryClient, [detail]),
  })
}

export const useMoveSavedRestaurantsMutation = (
  onError?: (error: Error) => void,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    ...(onError && { onError: (error: Error) => onError(error) }),
    mutationFn: ({
      collectionId,
      body,
    }: {
      collectionId: number
      body: MoveSavedRestaurantsBody
    }) => moveSavedRestaurants(collectionId, body),
    onSuccess: (result) =>
      synchronizeSavedCollections(queryClient, [
        result.sourceCollection,
        result.targetCollection,
      ]),
  })
}

export const useDeleteCollectionMutation = (
  onError?: (error: Error) => void,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    ...(onError && { onError: (error: Error) => onError(error) }),
    mutationFn: deleteCollection,
    onSuccess: async (_, collectionId) => {
      const detailKey = collectionQueryKeys.detail(collectionId)
      const restaurantsKey = collectionQueryKeys.restaurantLists(collectionId)
      await Promise.all([
        queryClient.cancelQueries({ queryKey: detailKey, exact: true }),
        queryClient.cancelQueries({ queryKey: restaurantsKey }),
      ])
      queryClient.removeQueries({ queryKey: detailKey, exact: true })
      queryClient.removeQueries({ queryKey: restaurantsKey })
      await queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.lists(),
      })
    },
  })
}
