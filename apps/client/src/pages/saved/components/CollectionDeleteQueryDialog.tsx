import { Button } from '@hashi/hds-ui'
import { useEffect, useRef } from 'react'

import { isValidCollectionId } from '@/pages/saved/api/collectionReadContracts'
import { CollectionConfirmDialog } from '@/pages/saved/components/CollectionConfirmDialog'
import {
  useDeleteCollectionMutation,
  useRemoveSavedRestaurantsMutation,
} from '@/pages/saved/mutations/useCollectionManagementMutations'
import { useCollectionQuery } from '@/pages/saved/queries/useCollectionQuery'
import { HttpStatusError } from '@/shared/api/apiError'
import { getErrorPresentation } from '@/shared/api/errorPresentation'
import { useAuthStatus } from '@/shared/hooks'
import { captureError } from '@/shared/lib/sentry'

type CollectionDeleteQueryDialogProps = {
  collectionId: number
  onClose: () => void
} & (
  | { kind: 'collection'; onDeleted: () => void }
  | {
      kind: 'restaurants'
      restaurantIds: readonly number[]
      onRemoved?: (ids: readonly number[]) => void
    }
)

/** 소유자 확인과 서버 성공 전에는 삭제·선택 해제를 완료한 것으로 표시하지 않는다. */
export const CollectionDeleteQueryDialog = (
  props: CollectionDeleteQueryDialogProps,
) => {
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  const { isAuthenticated } = useAuthStatus()
  const enabledId =
    isAuthenticated && isValidCollectionId(props.collectionId)
      ? props.collectionId
      : null
  const query = useCollectionQuery(enabledId)
  const remove = useRemoveSavedRestaurantsMutation(captureError)
  const deleteCollection = useDeleteCollectionMutation(captureError)
  const owned = query.data?.owner === true
  const queryError =
    query.error ??
    (query.data && !owned
      ? query.data.owner === false
        ? new HttpStatusError(403)
        : new Error('Missing collection ownership')
      : null)
  const validSelection =
    props.kind === 'collection' ||
    (props.restaurantIds.length > 0 &&
      props.restaurantIds.every(isValidCollectionId))

  if (!isAuthenticated || enabledId === null) return null
  return (
    <CollectionConfirmDialog
      open
      deletingCollection={props.kind === 'collection'}
      canConfirm={owned && !queryError && validSelection}
      onClose={props.onClose}
      onConfirm={async () => {
        if (!owned || queryError || !validSelection) return
        if (props.kind === 'restaurants') {
          await remove.mutateAsync({
            collectionId: props.collectionId,
            restaurantIds: props.restaurantIds,
          })
          if (!mounted.current) return
          props.onRemoved?.(props.restaurantIds)
          props.onClose()
        } else {
          await deleteCollection.mutateAsync(props.collectionId)
          if (!mounted.current) return
          props.onClose()
          props.onDeleted()
        }
      }}
    >
      {query.isPending && (
        <p role="status" className="typo-body-7 text-primary-200">
          불러오는 중…
        </p>
      )}
      {queryError && (
        <div className="flex flex-col gap-3">
          <p role="alert" className="typo-body-7 text-primary-400">
            {getErrorPresentation(queryError).message}
          </p>
          <Button
            size="sm"
            variant="neutral"
            disabled={query.isFetching}
            onClick={() => {
              void query.refetch()
            }}
          >
            다시 시도
          </Button>
        </div>
      )}
    </CollectionConfirmDialog>
  )
}
