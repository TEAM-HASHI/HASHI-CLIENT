import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

import type { CollectionDetailData } from '@/features/collection/api/collectionApiTypes'
import { deleteCollection } from '@/features/collection/api/deleteCollection'
import { getCollections } from '@/features/collection/api/getCollections'
import { moveSavedRestaurants } from '@/features/collection/api/moveSavedRestaurants'
import type { MoveSavedRestaurantsBody } from '@/features/collection/api/moveSavedRestaurants'
import { removeSavedRestaurants } from '@/features/collection/api/removeSavedRestaurants'
import { saveRestaurant } from '@/features/collection/api/saveRestaurant'
import { collectionMutationOptions } from '@/features/collection/mutations/collectionMutationOptions'
import { synchronizeCollectionHeader } from '@/features/collection/mutations/synchronizeCollectionHeader'
import {
  collectionQueryKeys,
  mapSaveQueryKeys,
  restaurantSaveQueryKeys,
} from '@/features/collection/queries/collectionQueryKeys'
import { assertCollectionSession } from '@/features/collection/utils/collectionSession'
import { getAuthSessionVersion } from '@/shared/auth/authSession'
import { isApiError } from '@/shared/api/apiError'

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
  reconciledIds: number[] = [],
) => {
  const updatedIds = await Promise.all(
    details.map((detail) =>
      synchronizeCollectionHeader(queryClient, detail, sessionVersion),
    ),
  )
  const ids = [...new Set([...updatedIds, ...reconciledIds])]
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
    ...reconciledIds
      .filter((id) => !updatedIds.includes(id))
      .map((id) =>
        queryClient.invalidateQueries({
          queryKey: collectionQueryKeys.detail(id, false, sessionVersion),
        }),
      ),
  ])
}

const readSavedStates = async (
  restaurantId: number,
  ids: number[],
  version: number,
) => {
  const states = new Map<number, boolean>()
  let cursor: number | undefined
  while (states.size < ids.length) {
    assertCollectionSession(version)
    const page = await getCollections({
      restaurantId,
      size: 50,
      ...(cursor !== undefined && { cursor }),
    })
    assertCollectionSession(version)
    for (const item of page.collections ?? []) {
      if (
        item.collectionId &&
        ids.includes(item.collectionId) &&
        typeof item.saved === 'boolean'
      )
        states.set(item.collectionId, item.saved)
    }
    if (!page.hasNext) break
    cursor = page.nextCursor ?? undefined
  }
  return states
}

export const useUpdateRestaurantCollectionsMutation = (
  onError?: (error: Error) => void,
) => {
  const queryClient = useQueryClient()
  const version = getAuthSessionVersion()
  return useMutation(
    collectionMutationOptions(
      queryClient,
      async ({
        restaurantId,
        changes,
      }: {
        restaurantId: number
        changes: Record<string, boolean>
      }) => {
        const details: CollectionDetailData[] = []
        const completedIds: string[] = []
        let error: unknown = null
        try {
          const states = await readSavedStates(
            restaurantId,
            Object.keys(changes).map(Number),
            version,
          )
          for (const [id, checked] of Object.entries(changes)) {
            assertCollectionSession(version)
            const collectionId = Number(id)
            if (!states.has(collectionId))
              throw new Error('Missing collection saved status')
            if (states.get(collectionId) !== checked) {
              try {
                details.push(
                  checked
                    ? await saveRestaurant(collectionId, { restaurantId })
                    : await removeSavedRestaurants(collectionId, [
                        restaurantId,
                      ]),
                )
              } catch (cause) {
                if (
                  !isApiError(cause) ||
                  !['USER-012', 'USER-013'].includes(cause.code)
                )
                  throw cause
                const latest = await readSavedStates(
                  restaurantId,
                  [collectionId],
                  version,
                )
                if (latest.get(collectionId) !== checked) throw cause
              }
            }
            completedIds.push(id)
          }
        } catch (cause) {
          error = cause
        }
        return { details, completedIds, error }
      },
      async (result, _variables, sessionVersion) => {
        if (result.completedIds.length)
          await synchronizeSavedCollections(
            queryClient,
            result.details,
            sessionVersion,
            result.completedIds.map(Number),
          )
      },
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
