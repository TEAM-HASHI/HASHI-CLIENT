import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

import type { CollectionDetailData } from '@/features/collection/api/collectionApiTypes'
import { deleteCollection } from '@/features/collection/api/deleteCollection'
import { moveSavedRestaurants } from '@/features/collection/api/moveSavedRestaurants'
import type { MoveSavedRestaurantsBody } from '@/features/collection/api/moveSavedRestaurants'
import { removeSavedRestaurants } from '@/features/collection/api/removeSavedRestaurants'
import { saveRestaurant } from '@/features/collection/api/saveRestaurant'
import type { SaveRestaurantBody } from '@/features/collection/api/saveRestaurant'
import { collectionMutationOptions } from '@/features/collection/mutations/collectionMutationOptions'
import { synchronizeCollectionHeader } from '@/features/collection/mutations/synchronizeCollectionHeader'
import { collectionQueryKeys } from '@/features/collection/queries/collectionQueryKeys'
import { assertCollectionSession } from '@/features/collection/utils/collectionSession'
import { restaurantSaveQueryKeys } from '@/features/restaurantDetail/queries/restaurantDetailQueryKeys'
import { restaurantDetailQueryKeys } from '@/features/restaurantDetail/queries/restaurantDetailQueryKeys'
import { mapSaveQueryKeys } from '@/features/collection/queries/collectionQueryKeys'

const refreshSaveSummaries = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: restaurantSaveQueryKeys.all() }),
    queryClient.invalidateQueries({
      queryKey: restaurantDetailQueryKeys.details(),
    }),
    queryClient.invalidateQueries({
      queryKey: restaurantDetailQueryKeys.randomRecommendation().slice(0, 2),
    }),
    queryClient.invalidateQueries({ queryKey: mapSaveQueryKeys.allCounts() }),
    queryClient.invalidateQueries({ queryKey: mapSaveQueryKeys.allSaved() }),
  ])

const synchronizeSavedCollections = async (
  queryClient: QueryClient,
  details: CollectionDetailData[],
  sessionVersion: number,
) => {
  const ids = await Promise.all(
    details.map((detail) =>
      synchronizeCollectionHeader(queryClient, detail, sessionVersion),
    ),
  )
  assertCollectionSession(sessionVersion)
  await Promise.all([
    refreshSaveSummaries(queryClient),
    queryClient.invalidateQueries({
      queryKey: collectionQueryKeys.lists(sessionVersion),
    }),
    ...ids.map((id) =>
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.restaurantLists(id, sessionVersion),
      }),
    ),
  ])
}

export const useSaveRestaurantMutation = (onError?: (error: Error) => void) => {
  const queryClient = useQueryClient()
  return useMutation(
    collectionMutationOptions(
      queryClient,
      ({
        collectionId,
        body,
      }: {
        collectionId: number
        body: SaveRestaurantBody
      }) => saveRestaurant(collectionId, body),
      (detail, _variables, version) =>
        synchronizeSavedCollections(queryClient, [detail], version),
      onError,
    ),
  )
}

export const useRemoveSavedRestaurantsMutation = (
  onError?: (error: Error) => void,
) => {
  const queryClient = useQueryClient()
  return useMutation(
    collectionMutationOptions(
      queryClient,
      ({
        collectionId,
        restaurantIds,
      }: {
        collectionId: number
        restaurantIds: readonly number[]
      }) => removeSavedRestaurants(collectionId, restaurantIds),
      (detail, _variables, version) =>
        synchronizeSavedCollections(queryClient, [detail], version),
      onError,
    ),
  )
}

export const useMoveSavedRestaurantsMutation = (
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
        body: MoveSavedRestaurantsBody
      }) => moveSavedRestaurants(collectionId, body),
      (result, _variables, version) =>
        synchronizeSavedCollections(
          queryClient,
          [result.sourceCollection, result.targetCollection],
          version,
        ),
      onError,
    ),
  )
}

export const useDeleteCollectionMutation = (
  onError?: (error: Error) => void,
) => {
  const queryClient = useQueryClient()
  return useMutation(
    collectionMutationOptions(
      queryClient,
      deleteCollection,
      async (_data, collectionId, version) => {
        const detailKey = collectionQueryKeys.detail(
          collectionId,
          false,
          version,
        )
        const restaurantsKey = collectionQueryKeys.restaurantLists(
          collectionId,
          version,
        )
        await Promise.all([
          queryClient.cancelQueries({ queryKey: detailKey, exact: true }),
          queryClient.cancelQueries({ queryKey: restaurantsKey }),
        ])
        assertCollectionSession(version)
        queryClient.removeQueries({ queryKey: detailKey, exact: true })
        queryClient.removeQueries({ queryKey: restaurantsKey })
        await queryClient.invalidateQueries({
          queryKey: collectionQueryKeys.lists(version),
        })
        await refreshSaveSummaries(queryClient)
      },
      onError,
    ),
  )
}
