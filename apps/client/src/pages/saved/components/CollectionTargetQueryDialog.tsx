import { runWithCollectionSession } from '@/pages/saved/utils/collectionSession'

import { getAuthSessionVersion } from '@/shared/auth/authSession'
import { useCollectionSessionVersion } from '@/pages/saved/hooks/useCollectionSessionVersion'

import { Button } from '@hashi/hds-ui'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { getCollectionMovePlan } from '@/pages/saved/api/getCollectionMovePlan'
import { isValidCollectionId } from '@/pages/saved/api/collectionReadContracts'
import { CollectionTargetDialogView } from '@/pages/saved/components/CollectionSaveDialog'
import {
  useMoveSavedRestaurantsMutation,
  useSaveRestaurantMutation,
} from '@/pages/saved/mutations/useCollectionManagementMutations'
import { collectionQueryKeys } from '@/pages/saved/queries/collectionQueryKeys'
import { useCollectionQuery } from '@/pages/saved/queries/useCollectionQuery'
import { useCollectionsInfiniteQuery } from '@/pages/saved/queries/useCollectionsInfiniteQuery'
import { mapCollectionSummary } from '@/pages/saved/utils/collectionReadAdapters'
import {
  getCollectionSaveSelectedId,
  getCollectionSaveState,
} from '@/pages/saved/utils/collectionNavigation'
import { checkHasHttpStatus, HttpStatusError } from '@/shared/api/apiError'
import { getErrorPresentation } from '@/shared/api/errorPresentation'
import { useAuthStatus, useInfiniteScrollTrigger } from '@/shared/hooks'
import { captureError } from '@/shared/lib/sentry'

type CollectionTargetQueryDialogProps = {
  onClose: () => void
  createState?: unknown
} & (
  | { mode: 'save'; restaurantId: number }
  | {
      mode: 'move'
      sourceCollectionId: number
      restaurantIds: readonly number[]
      onMoved?: (ids: readonly number[]) => void
    }
)

export const CollectionTargetQueryDialog = (
  props: CollectionTargetQueryDialogProps,
) => {
  const sessionVersion = useCollectionSessionVersion()
  const initialSessionVersion = useRef(sessionVersion)
  return (
    <CollectionTargetQueryDialogContent
      key={sessionVersion}
      {...props}
      restoreSelection={initialSessionVersion.current === sessionVersion}
    />
  )
}

const CollectionTargetQueryDialogContent = (
  props: CollectionTargetQueryDialogProps & { restoreSelection: boolean },
) => {
  const sessionVersion = useCollectionSessionVersion()
  const location = useLocation()
  const { isAuthenticated } = useAuthStatus()
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  const [selectedId, setSelectedId] = useState(() =>
    getCollectionSaveSelectedId(props.restoreSelection ? location.state : null),
  )
  const [listRoot, setListRoot] = useState<HTMLDivElement | null>(null)
  const moving = props.mode === 'move'
  const restaurantIds = props.mode === 'move' ? props.restaurantIds : []
  const sourceId = props.mode === 'move' ? props.sourceCollectionId : null
  const validInputs =
    props.mode === 'save'
      ? isValidCollectionId(props.restaurantId)
      : isValidCollectionId(sourceId) &&
        restaurantIds.length > 0 &&
        restaurantIds.every(isValidCollectionId)
  const enabled = isAuthenticated && validInputs
  const listQuery = useCollectionsInfiniteQuery(
    enabled
      ? {
          size: 20,
          ...(props.mode === 'save' && { restaurantId: props.restaurantId }),
        }
      : null,
  )
  const sourceQuery = useCollectionQuery(enabled && moving ? sourceId : null)
  const sourceOwned = sourceQuery.data?.owner === true && !sourceQuery.error
  const collections = (listQuery.data?.pages ?? []).flatMap((page) =>
    (page.collections ?? []).map(mapCollectionSummary),
  )
  const selected = collections.find(
    (item) => item.id === selectedId && item.id !== String(sourceId),
  )
  const targetId = selected ? Number(selected.id) : null
  const planQuery = useQuery({
    queryKey: collectionQueryKeys.movePlan(
      targetId,
      restaurantIds,
      sessionVersion,
    ),
    queryFn: ({ signal }) => {
      if (
        !isValidCollectionId(targetId) ||
        !restaurantIds.length ||
        !restaurantIds.every(isValidCollectionId)
      )
        throw new Error('Move target is not ready')
      return runWithCollectionSession(sessionVersion, () =>
        getCollectionMovePlan(targetId, restaurantIds, signal),
      )
    },
    enabled: enabled && moving && sourceOwned && isValidCollectionId(targetId),
    staleTime: 0,
    gcTime: 0,
    throwOnError: false,
  })
  const planReady =
    planQuery.isSuccess && !planQuery.isFetching && !planQuery.error
  const save = useSaveRestaurantMutation(captureError)
  const move = useMoveSavedRestaurantsMutation(captureError)
  const loadMoreRef = useInfiniteScrollTrigger<HTMLDivElement>({
    root: listRoot,
    enabled: enabled && listQuery.hasNextPage && !listQuery.error,
    isLoading: listQuery.isFetching,
    onIntersect: () => {
      if (listQuery.isFetching || !listQuery.hasNextPage || listQuery.error)
        return
      return listQuery.fetchNextPage()
    },
  })
  const sourceError =
    sourceQuery.error ??
    (sourceQuery.data && !sourceOwned
      ? sourceQuery.data.owner === false
        ? new HttpStatusError(403)
        : new Error('Missing collection ownership')
      : null)
  const feedbackError = moving
    ? (sourceError ?? planQuery.error)
    : selected && selected.saved === undefined
      ? new Error('Missing saved status')
      : null
  const feedback = () => {
    if (!moving || !selected) return ''
    if (planQuery.isFetching) return '불러오는 중…'
    if (!planReady) return ''
    const count = planQuery.data.duplicateIds.length
    if (!count) return ''
    return restaurantIds.length === 1
      ? '이미 저장된 식당이에요.'
      : `이미 저장된 ${count}곳은 이동하지 않아요.`
  }

  if (!enabled) return null
  return (
    <CollectionTargetDialogView
      title={moving ? '컬렉션 이동' : '컬렉션 저장'}
      collections={collections}
      selectedId={selectedId}
      onSelect={setSelectedId}
      onClose={props.onClose}
      excludeId={moving ? String(sourceId) : undefined}
      createState={
        props.createState ??
        (props.mode === 'save'
          ? getCollectionSaveState(location.state, String(props.restaurantId))
          : location.state)
      }
      onListMount={setListRoot}
      isDisabled={(id) =>
        props.mode === 'save' &&
        collections.find((item) => item.id === id)?.saved === true
      }
      confirmDisabled={
        !listQuery.data ||
        (!moving && selected?.saved !== false) ||
        (moving &&
          (!sourceOwned || !planReady || !planQuery.data?.movableIds.length))
      }
      confirmLabel={() =>
        moving
          ? planReady
            ? `이동 ${planQuery.data.movableIds.length}`
            : '이동'
          : '저장'
      }
      feedback={feedback}
      notice={
        feedbackError && (
          <div className="mt-3 flex flex-col gap-3">
            <p role="alert" className="typo-body-7 text-primary-400">
              {getErrorPresentation(feedbackError).message}
            </p>
            <Button
              size="sm"
              variant="neutral"
              disabled={
                listQuery.isFetching ||
                sourceQuery.isFetching ||
                planQuery.isFetching
              }
              onClick={() => {
                if (!moving) void listQuery.refetch()
                else if (sourceError) void sourceQuery.refetch()
                else void planQuery.refetch()
              }}
            >
              다시 시도
            </Button>
          </div>
        )
      }
      listStatus={
        <>
          {(listQuery.isPending || listQuery.isFetchingNextPage) && (
            <p role="status" className="typo-body-7 text-primary-200 py-3">
              불러오는 중…
            </p>
          )}
          {listQuery.error && (
            <div className="flex flex-col gap-3 py-3">
              <p role="alert" className="typo-body-7 text-primary-400">
                {getErrorPresentation(listQuery.error).message}
              </p>
              <Button
                size="sm"
                variant="neutral"
                disabled={listQuery.isFetching}
                onClick={() => {
                  if (listQuery.isFetchNextPageError)
                    void listQuery.fetchNextPage()
                  else void listQuery.refetch()
                }}
              >
                다시 시도
              </Button>
            </div>
          )}
          <div aria-hidden="true" className="h-px" ref={loadMoreRef} />
        </>
      }
      onConfirm={async (id) => {
        if (id !== selectedId || !selected || !isValidCollectionId(targetId))
          return
        if (props.mode === 'save') {
          if (selected.saved !== false) return
          try {
            await save.mutateAsync({
              collectionId: targetId,
              body: { restaurantId: props.restaurantId },
            })
          } catch (cause) {
            if (checkHasHttpStatus(cause) && cause.status === 409)
              void listQuery.refetch()
            throw cause
          }
          if (mounted.current && sessionVersion === getAuthSessionVersion())
            props.onClose()
        } else {
          if (!sourceOwned || !planReady || !planQuery.data.movableIds.length)
            return
          const movedIds = planQuery.data.movableIds
          try {
            await move.mutateAsync({
              collectionId: props.sourceCollectionId,
              body: { targetCollectionId: targetId, restaurantIds: movedIds },
            })
          } catch (cause) {
            if (checkHasHttpStatus(cause) && cause.status === 409)
              void planQuery.refetch()
            throw cause
          }
          if (!mounted.current || sessionVersion !== getAuthSessionVersion())
            return
          props.onMoved?.(movedIds)
          props.onClose()
        }
      }}
    />
  )
}
