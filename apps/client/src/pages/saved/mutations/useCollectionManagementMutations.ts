import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

import type { CollectionDetailData } from '@/pages/saved/api/collectionApiTypes'
import { deleteCollection } from '@/pages/saved/api/deleteCollection'
import { moveSavedRestaurants } from '@/pages/saved/api/moveSavedRestaurants'
import type { MoveSavedRestaurantsBody } from '@/pages/saved/api/moveSavedRestaurants'
import { removeSavedRestaurants } from '@/pages/saved/api/removeSavedRestaurants'
import { saveRestaurant } from '@/pages/saved/api/saveRestaurant'
import type { SaveRestaurantBody } from '@/pages/saved/api/saveRestaurant'
import { collectionMutationOptions } from '@/pages/saved/mutations/collectionMutationOptions'
import { synchronizeCollectionHeader } from '@/pages/saved/mutations/synchronizeCollectionHeader'
import { collectionQueryKeys } from '@/pages/saved/queries/collectionQueryKeys'
import { assertCollectionSession } from '@/pages/saved/utils/collectionSession'
import { restaurantSaveQueryKeys } from '@/features/restaurantDetail/queries/restaurantDetailQueryKeys'
import { mapSaveQueryKeys } from '@/pages/map/queries/mapQueryKeys'

const refreshSaveSummaries = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: restaurantSaveQueryKeys.all() }),
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
