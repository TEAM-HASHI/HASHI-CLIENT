import { getAuthSessionVersion } from '@/shared/auth/authSession'
import { useCollectionSessionVersion } from '@/features/collection/hooks/useCollectionSessionVersion'

import { LinkIcon } from '@hashi/hds-icons'
import { Button, showToast, toastQueue } from '@hashi/hds-ui'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import {
  getCollectionDetailPath,
  getCollectionEditPath,
  getCollectionRestaurantEditPath,
} from '@/app/router/routePaths'
import { useAuthStatus } from '@/shared/hooks/useAuthStatus'
import { isValidCollectionId } from '@/features/collection/api/collectionReadContracts'
import {
  CollectionActionMenu,
  CollectionEditMenu,
} from '@/pages/saved/components/CollectionDropdown'
import { CollectionConfirmDialog } from '@/pages/saved/components/CollectionConfirmDialog'
import { useUpdateCollectionMutation } from '@/features/collection/mutations/useCollectionFormMutations'
import {
  collectionQueryOptions,
  useCollectionQuery,
} from '@/features/collection/queries/useCollectionQuery'
import { HttpStatusError } from '@/shared/api/apiError'
import { getErrorPresentation } from '@/shared/api/errorPresentation'
import { captureError } from '@/shared/lib/sentry'
import { copyUrlToClipboard } from '@/shared/utils/clipboard'
import type { CollectionSummaryReadModelTypes } from '@/features/collection/types/collectionReadModels'
import { CollectionDeleteQueryDialog } from '@/pages/saved/components/CollectionDeleteQueryDialog'
import { CollectionTargetQueryDialog } from '@/features/collection/components/CollectionTargetQueryDialog'
import type { CollectionManagementAction } from '@/features/collection/types'
import { SavedQueryPage } from '@/pages/saved/SavedQueryPage'
import {
  COLLECTION_CATEGORY_OPTIONS,
  COLLECTION_SORT_OPTIONS,
  INITIAL_COLLECTION_VIEW,
} from '@/features/collection/types'
import { isCollectionMapState } from '@/features/collection/utils/collectionMapState'
import {
  getCollectionFormState,
  getCollectionManagementAction,
  getCollectionManagementState,
  getCollectionSaveRestaurantId,
  getCollectionSaveState,
} from '@/features/collection/utils/collectionNavigation'

export const SavedApiPage = ({ embedded = false }: { embedded?: boolean }) => {
  const location = useLocation()
  const sessionVersion = useCollectionSessionVersion()
  const [initialSessionVersion] = useState(sessionVersion)
  return (
    <SavedApiScreen
      embedded={embedded}
      key={`${location.pathname}:${sessionVersion}`}
      restoreState={
        initialSessionVersion === sessionVersion ? location.state : null
      }
    />
  )
}

const SavedApiScreen = ({
  restoreState,
  embedded,
}: {
  restoreState: unknown
  embedded: boolean
}) => {
  const queryClient = useQueryClient()
  const sessionVersion = useCollectionSessionVersion()
  const { isAuthenticated } = useAuthStatus()
  const location = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [management, setManagement] =
    useState<CollectionManagementAction | null>(() =>
      getCollectionManagementAction(restoreState),
    )
  const [saveId, setSaveId] = useState(() =>
    getCollectionSaveRestaurantId(restoreState),
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
  const sharing = useRef(false)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  const copyCollectionLink = async (id: string) => {
    if (copying.current) return
    copying.current = true
    let copied = false
    try {
      copied = await copyUrlToClipboard(getCollectionDetailPath(id))
    } catch {
      // Clipboard support/permission failures do not undo a successful publish.
    } finally {
      copying.current = false
    }
    if (!mounted.current || sessionVersion !== getAuthSessionVersion()) return
    toastQueue.clear()
    showToast({
      ...(copied && { icon: <LinkIcon className="size-6" /> }),
      children: copied
        ? '컬렉션 링크가 복사되었어요.'
        : '링크를 복사하지 못했습니다. 다시 시도해주세요.',
    })
  }
  const share = async (collection: CollectionSummaryReadModelTypes) => {
    if (!isAuthenticated || copying.current || sharing.current) return
    sharing.current = true
    try {
      const detail = await queryClient.fetchQuery({
        ...collectionQueryOptions(Number(collection.id), false, sessionVersion),
        staleTime: 0,
      })
      if (!mounted.current || sessionVersion !== getAuthSessionVersion()) return
      if (detail.owner !== true) throw new HttpStatusError(403)
      if (detail.visibility === 'public')
        await copyCollectionLink(collection.id)
      else if (detail.visibility === 'private')
        setManagement({ collectionId: collection.id, type: 'share' })
      else throw new Error('Invalid collection visibility')
    } catch (error) {
      if (!mounted.current || sessionVersion !== getAuthSessionVersion()) return
      captureError(error)
      toastQueue.clear()
      showToast({ children: getErrorPresentation(error).message })
    } finally {
      sharing.current = false
    }
  }
  const restoredView = isCollectionMapState(restoreState)
    ? restoreState
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
      !getCollectionManagementAction(restoreState) &&
      !getCollectionSaveRestaurantId(restoreState)
    )
      return
    navigate(
      { pathname: location.pathname, search: location.search },
      {
        replace: true,
        state: getCollectionManagementState(
          getCollectionSaveState(restoreState, null),
          null,
        ),
      },
    )
  }, [location, navigate, restoreState])

  const close = () => {
    setManagement(null)
    setSaveId(null)
    navigate(
      { pathname: location.pathname, search: location.search },
      {
        replace: true,
        state: getCollectionManagementState(
          getCollectionSaveState(restoreState, null),
          null,
        ),
      },
    )
  }
  return (
    <>
      <SavedQueryPage
        embedded={embedded}
        onCreate={() =>
          navigate(ROUTES.collectionNew, {
            state: getCollectionFormState(location),
          })
        }
        renderCollectionActions={(collection) => (
          <CollectionEditMenu
            context={embedded ? 'panel' : 'page'}
            name={collection.name ?? ''}
            onShare={() => share(collection)}
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
          <CollectionActionMenu
            label="컬렉션 더보기"
            onShare={() => share(collection)}
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
              if (
                !mounted.current ||
                sessionVersion !== getAuthSessionVersion()
              )
                return
              await copyCollectionLink(String(collectionId))
              if (mounted.current && sessionVersion === getAuthSessionVersion())
                close()
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
            onDeleted={() => {
              if (location.pathname !== ROUTES.map) {
                navigate(ROUTES.saved, { replace: true })
              } else if (isCollectionMapState(location.state)) {
                navigate(ROUTES.map, {
                  replace: true,
                  state: {
                    mapSavedCollectionsOpen: true,
                    mapSavedCollectionsSession: sessionVersion,
                  },
                })
              }
            }}
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
            createState={getCollectionManagementState(restoreState, management)}
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
