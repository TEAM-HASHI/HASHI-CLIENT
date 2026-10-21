import { LinkIcon } from '@hashi/hds-icons'
import { Button, IconButton, showToast, toastQueue } from '@hashi/hds-ui'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import {
  getCollectionDetailPath,
  getCollectionEditPath,
  getCollectionRestaurantEditPath,
} from '@/app/router/routePaths'
import { useAuthStatus } from '@/shared/hooks/useAuthStatus'
import { isValidCollectionId } from '@/pages/saved/api/collectionReadContracts'
import {
  CollectionActionMenu,
  CollectionEditMenu,
} from '@/pages/saved/components/CollectionDropdown'
import { CollectionConfirmDialog } from '@/pages/saved/components/CollectionConfirmDialog'
import { useUpdateCollectionMutation } from '@/pages/saved/mutations/useCollectionFormMutations'
import { useCollectionQuery } from '@/pages/saved/queries/useCollectionQuery'
import { HttpStatusError } from '@/shared/api/apiError'
import { getErrorPresentation } from '@/shared/api/errorPresentation'
import { captureError } from '@/shared/lib/sentry'
import { copyUrlToClipboard } from '@/shared/utils/clipboard'
import type { CollectionSummaryReadModelTypes } from '@/pages/saved/types/collectionReadModels'
import { CollectionDeleteQueryDialog } from '@/pages/saved/components/CollectionDeleteQueryDialog'
import { CollectionTargetQueryDialog } from '@/pages/saved/components/CollectionTargetQueryDialog'
import type { CollectionManagementAction } from '@/pages/saved/components/CollectionEditor'
import { SavedQueryPage } from '@/pages/saved/SavedQueryPage'
import {
  COLLECTION_CATEGORY_OPTIONS,
  COLLECTION_SORT_OPTIONS,
  INITIAL_COLLECTION_VIEW,
} from '@/pages/saved/types'
import { isCollectionMapState } from '@/pages/saved/utils/collectionMapState'
import {
  getCollectionFormState,
  getCollectionManagementAction,
  getCollectionManagementState,
  getCollectionSaveRestaurantId,
  getCollectionSaveState,
} from '@/pages/saved/utils/collectionNavigation'

export const SavedApiPage = () => {
  const location = useLocation()
  return <SavedApiScreen key={location.pathname} />
}

const SavedApiScreen = () => {
  const { isAuthenticated } = useAuthStatus()
  const location = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [management, setManagement] =
    useState<CollectionManagementAction | null>(() =>
      getCollectionManagementAction(location.state),
    )
  const [saveId, setSaveId] = useState(() =>
    getCollectionSaveRestaurantId(location.state),
  )
  const collectionId = management ? Number(management.collectionId) : null
  const restaurantIds = (management?.restaurantIds ?? []).map(Number)
  const validSelection =
    restaurantIds.length > 0 && restaurantIds.every(isValidCollectionId)
  const shareQuery = useCollectionQuery(
    isAuthenticated && management?.type === 'share' ? collectionId : null,
  )
  const publish = useUpdateCollectionMutation(captureError)
  const shareError =
    shareQuery.error ??
    (shareQuery.data && shareQuery.data.owner !== true
      ? new HttpStatusError(403)
      : null)
  const mounted = useRef(true)
  const copying = useRef(false)
  const [isCopying, setIsCopying] = useState(false)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  const copyCollectionLink = async (id: string) => {
    if (copying.current) return
    copying.current = true
    setIsCopying(true)
    let copied = false
    try {
      copied = await copyUrlToClipboard(getCollectionDetailPath(id))
    } catch {
      // Clipboard support/permission failures do not undo a successful publish.
    } finally {
      copying.current = false
      if (mounted.current) setIsCopying(false)
    }
    if (!mounted.current) return
    toastQueue.clear()
    showToast({
      ...(copied && { icon: <LinkIcon className="size-6" /> }),
      children: copied
        ? '컬렉션 링크가 복사되었어요.'
        : '링크를 복사하지 못했습니다. 다시 시도해주세요.',
    })
  }
  const share = (collection: CollectionSummaryReadModelTypes) => {
    if (!isAuthenticated || copying.current) return
    if (collection.isPublic === true) void copyCollectionLink(collection.id)
    else if (collection.isPublic === false)
      setManagement({ collectionId: collection.id, type: 'share' })
  }
  const restoredView = isCollectionMapState(location.state)
    ? location.state
    : INITIAL_COLLECTION_VIEW
  const sort =
    COLLECTION_SORT_OPTIONS.find((item) => item.value === params.get('sort'))
      ?.value ?? restoredView.sort
  const category =
    COLLECTION_CATEGORY_OPTIONS.find(
      (item) => item.value === params.get('category'),
    )?.value ?? restoredView.category

  // 생성 화면 복귀용 상태는 이번 화면에서만 사용한다.
  useEffect(() => {
    if (
      !getCollectionManagementAction(location.state) &&
      !getCollectionSaveRestaurantId(location.state)
    )
      return
    navigate(
      { pathname: location.pathname, search: location.search },
      {
        replace: true,
        state: getCollectionManagementState(
          getCollectionSaveState(location.state, null),
          null,
        ),
      },
    )
  }, [location, navigate])

  const close = () => {
    setManagement(null)
    setSaveId(null)
    navigate(
      { pathname: location.pathname, search: location.search },
      {
        replace: true,
        state: getCollectionManagementState(
          getCollectionSaveState(location.state, null),
          null,
        ),
      },
    )
  }
  return (
    <>
      <SavedQueryPage
        onCreate={() =>
          navigate(ROUTES.collectionNew, {
            state: getCollectionFormState(location),
          })
        }
        renderCollectionActions={(collection) => (
          <CollectionEditMenu
            name={collection.name ?? ''}
            context="panel"
            onShare={
              collection.isPublic === undefined
                ? undefined
                : () => share(collection)
            }
            onEdit={() =>
              navigate(getCollectionEditPath(collection.id), {
                state: getCollectionFormState(location),
              })
            }
            onDelete={() =>
              setManagement({ collectionId: collection.id, type: 'delete' })
            }
          />
        )}
        renderDetailActions={(collection) => (
          <>
            {collection.isPublic !== undefined && (
              <IconButton
                size="xs"
                aria-label="컬렉션 공유"
                disabled={isCopying}
                onClick={() => share(collection)}
              >
                <LinkIcon className="size-6" />
              </IconButton>
            )}
            <CollectionActionMenu
              label="컬렉션 더보기"
              onManage={() =>
                navigate(
                  `${getCollectionRestaurantEditPath(collection.id)}?${new URLSearchParams({ sort, category })}`,
                  { state: { collectionEditorReturnKey: location.key } },
                )
              }
              onDelete={() =>
                setManagement({ collectionId: collection.id, type: 'delete' })
              }
            />
          </>
        )}
        renderRestaurantActions={(restaurant, collection) => (
          <CollectionActionMenu
            restaurant
            label={`${restaurant.name} 더보기`}
            onManage={() =>
              setManagement({
                collectionId: collection.id,
                type: 'move',
                restaurantIds: [restaurant.id],
              })
            }
            onDelete={() =>
              setManagement({
                collectionId: collection.id,
                type: 'remove',
                restaurantIds: [restaurant.id],
              })
            }
          />
        )}
      />
      {isAuthenticated &&
        isValidCollectionId(collectionId) &&
        management?.type === 'share' && (
          <CollectionConfirmDialog
            open
            sharing
            onClose={close}
            canConfirm={
              !shareError &&
              shareQuery.data?.owner === true &&
              (shareQuery.data.visibility === 'public' ||
                shareQuery.data.visibility === 'private')
            }
            onConfirm={async () => {
              if (shareError || shareQuery.data?.owner !== true) return
              if (shareQuery.data.visibility !== 'public') {
                await publish.mutateAsync({
                  collectionId,
                  body: { visibility: 'public' },
                })
              }
              if (!mounted.current) return
              await copyCollectionLink(String(collectionId))
              if (mounted.current) close()
            }}
          >
            {shareQuery.isPending && <p role="status">불러오는 중…</p>}
            {shareError && (
              <div className="flex flex-col gap-3">
                <p role="alert" className="typo-body-7 text-primary-400">
                  {getErrorPresentation(shareError).message}
                </p>
                <Button
                  size="sm"
                  variant="neutral"
                  disabled={shareQuery.isFetching}
                  onClick={() => {
                    void shareQuery.refetch()
                  }}
                >
                  다시 시도
                </Button>
              </div>
            )}
          </CollectionConfirmDialog>
        )}
      {isAuthenticated &&
        isValidCollectionId(collectionId) &&
        management?.type === 'delete' && (
          <CollectionDeleteQueryDialog
            kind="collection"
            collectionId={collectionId}
            onClose={close}
            onDeleted={() => navigate(ROUTES.saved, { replace: true })}
          />
        )}
      {isAuthenticated &&
        isValidCollectionId(collectionId) &&
        validSelection &&
        management?.type === 'remove' && (
          <CollectionDeleteQueryDialog
            kind="restaurants"
            collectionId={collectionId}
            restaurantIds={restaurantIds}
            onClose={close}
          />
        )}
      {isAuthenticated &&
        isValidCollectionId(collectionId) &&
        validSelection &&
        management?.type === 'move' && (
          <CollectionTargetQueryDialog
            mode="move"
            sourceCollectionId={collectionId}
            restaurantIds={restaurantIds}
            createState={getCollectionManagementState(
              location.state,
              management,
            )}
            onClose={close}
          />
        )}
      {isAuthenticated &&
        saveId !== null &&
        isValidCollectionId(Number(saveId)) && (
          <CollectionTargetQueryDialog
            mode="save"
            restaurantId={Number(saveId)}
            onClose={close}
          />
        )}
    </>
  )
}
