import { useCollectionSessionVersion } from '@/features/collection/hooks/useCollectionSessionVersion'

import { BackIcon } from '@hashi/hds-icons'
import { Button, Checkbox, Header, IconButton } from '@hashi/hds-ui'
import { useEffect, useState } from 'react'
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { getCollectionDetailPath } from '@/app/router/routePaths'
import { isValidCollectionId } from '@/features/collection/api/collectionReadContracts'
import { CollectionDeleteQueryDialog } from '@/pages/saved/components/CollectionDeleteQueryDialog'
import { CollectionTargetQueryDialog } from '@/features/collection/components/CollectionTargetQueryDialog'
import { SavedRestaurantRow } from '@/pages/saved/components/SavedRestaurantRow'
import { useCollectionQuery } from '@/features/collection/queries/useCollectionQuery'
import { useSavedRestaurantsInfiniteQuery } from '@/features/collection/queries/useSavedRestaurantsInfiniteQuery'
import {
  COLLECTION_CATEGORY_OPTIONS,
  COLLECTION_SORT_OPTIONS,
} from '@/features/collection/types'
import { mapSavedRestaurant } from '@/features/collection/utils/collectionReadAdapters'
import {
  getCollectionEditorReturnKey,
  getCollectionManagementAction,
  getCollectionManagementState,
  getCollectionSaveState,
} from '@/features/collection/utils/collectionNavigation'
import { HttpStatusError } from '@/shared/api/apiError'
import { getErrorPresentation } from '@/shared/api/errorPresentation'
import { BottomActionBar } from '@/shared/components/bottomActionBar/BottomActionBar'
import { useAuthStatus, useInfiniteScrollTrigger } from '@/shared/hooks'

const SELECTION_CLASS =
  'shrink-0 [&>span:first-of-type]:size-6 [&>span:first-of-type]:rounded-full [&>span:first-of-type]:border [&>span:first-of-type]:border-warm-gray-100 [&>span:first-of-type]:bg-white [&>span:first-of-type]:text-warm-gray-100 [&>span:first-of-type>svg]:size-5 [&>input:checked+span]:bg-cool-gray-900 [&>input:checked+span]:border-cool-gray-900 [&>input:checked+span]:text-white'

export const CollectionEditorQueryPage = () => {
  const sessionVersion = useCollectionSessionVersion()
  const [initialSessionVersion] = useState(sessionVersion)
  const { collectionId } = useParams<{ collectionId: string }>()
  const [params] = useSearchParams()
  const id =
    collectionId && /^[1-9]\d*$/.test(collectionId)
      ? Number(collectionId)
      : null
  const sort =
    COLLECTION_SORT_OPTIONS.find((item) => item.value === params.get('sort'))
      ?.value ?? 'latest'
  const category =
    COLLECTION_CATEGORY_OPTIONS.find(
      (item) => item.value === params.get('category'),
    )?.value ?? 'all'
  if (!isValidCollectionId(id)) return <Navigate to={ROUTES.saved} replace />
  return (
    <CollectionEditorQuery
      key={`${id}:${sort}:${category}:${sessionVersion}`}
      restoreState={initialSessionVersion === sessionVersion}
      collectionId={id}
      sort={sort}
      category={category}
    />
  )
}

const CollectionEditorQuery = ({
  collectionId,
  sort,
  category,
  restoreState,
}: {
  restoreState: boolean
  collectionId: number
  sort: (typeof COLLECTION_SORT_OPTIONS)[number]['value']
  category: (typeof COLLECTION_CATEGORY_OPTIONS)[number]['value']
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStatus()
  const [restored] = useState(() => {
    const action = restoreState
      ? getCollectionManagementAction(location.state)
      : null
    return action?.collectionId === String(collectionId) &&
      action.type === 'edit'
      ? action
      : null
  })
  const [selected, setSelected] = useState<readonly string[]>(
    restored?.restaurantIds ?? [],
  )
  const [dialog, setDialog] = useState<'move' | 'remove' | null>(
    restored?.dialog ?? null,
  )
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null)
  const detailQuery = useCollectionQuery(isAuthenticated ? collectionId : null)
  const owned = detailQuery.data?.owner === true
  const listQuery = useSavedRestaurantsInfiniteQuery(
    isAuthenticated && owned ? collectionId : null,
    { sort, category, size: 20 },
  )
  const restaurants = (listQuery.data?.pages ?? []).flatMap((page) =>
    (page.content ?? []).map(mapSavedRestaurant),
  )
  const selectedIds = selected.filter((id) =>
    restaurants.some((restaurant) => restaurant.id === id),
  )
  const allSelected =
    restaurants.length > 0 && selectedIds.length === restaurants.length
  const error =
    detailQuery.error ??
    (detailQuery.data && !owned ? new HttpStatusError(403) : listQuery.error)
  const canEdit = owned && !detailQuery.error && listQuery.data !== undefined
  const loadMoreRef = useInfiniteScrollTrigger<HTMLDivElement>({
    root: scrollRoot,
    enabled: isAuthenticated && owned && listQuery.hasNextPage && !error,
    isLoading: listQuery.isFetching,
    onIntersect: () => {
      if (listQuery.isFetching || !listQuery.hasNextPage || error) return
      return listQuery.fetchNextPage()
    },
  })
  // 생성에서 돌아온 선택은 이번 편집에서만 소비한다.
  useEffect(() => {
    const action = restoreState
      ? getCollectionManagementAction(location.state)
      : null
    if (
      action?.collectionId !== String(collectionId) ||
      action.type !== 'edit' ||
      (action.restaurantIds === undefined && action.dialog === undefined)
    )
      return
    navigate(
      { pathname: location.pathname, search: location.search },
      {
        replace: true,
        state: getCollectionManagementState(location.state, {
          collectionId: String(collectionId),
          type: 'edit',
        }),
      },
    )
  }, [collectionId, location, navigate, restoreState])
  const closeDialog = () => {
    setDialog(null)
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
  const clearCompleted = (ids: readonly number[]) => {
    setSelected((current) => current.filter((id) => !ids.includes(Number(id))))
  }
  const close = () => {
    if (getCollectionEditorReturnKey(location.state)) navigate(-1)
    else
      navigate(
        {
          pathname: getCollectionDetailPath(String(collectionId)),
          search: new URLSearchParams({ sort, category }).toString(),
        },
        { replace: true },
      )
  }
  if (!isAuthenticated) return null
  return (
    <>
      <section
        aria-label="컬렉션 편집"
        className="app-mobile-bottom-action-content flex h-[calc(100dvh-var(--app-content-bottom,0px))] flex-col overflow-hidden bg-white pt-[var(--safe-area-top,0px)]"
      >
        <Header
          className="shrink-0"
          title={detailQuery.data?.name}
          subtitle="편집하기"
          contentClassName="[&>div:first-child]:typo-sub-header-2"
          leftAction={
            <IconButton size="xs" aria-label="편집 종료" onClick={close}>
              <BackIcon className="size-6" />
            </IconButton>
          }
        />
        {owned && (
          <div className="border-warm-gray-50 flex h-11.5 w-full shrink-0 items-center border-b px-5">
            <Checkbox
              className={SELECTION_CLASS}
              aria-label="전체 선택"
              disabled={!canEdit || !restaurants.length}
              checked={allSelected}
              ref={(node) => {
                if (node)
                  node.indeterminate = selectedIds.length > 0 && !allSelected
              }}
              onChange={() =>
                setSelected(
                  allSelected ? [] : restaurants.map((item) => item.id),
                )
              }
            >
              <span className="typo-body-5 text-primary-200">전체 선택</span>
            </Checkbox>
          </div>
        )}
        <div
          ref={setScrollRoot}
          role="region"
          aria-label="편집 식당 목록"
          className="min-h-0 w-full flex-1 overflow-y-auto overscroll-contain px-5"
        >
          {(detailQuery.isPending || (owned && listQuery.isPending)) && (
            <p role="status" className="typo-body-5 text-primary-200 py-3">
              불러오는 중…
            </p>
          )}
          {owned && (
            <>
              {selectedIds.length > 0 && (
                <p className="typo-body-5 text-primary-200 py-3" role="status">
                  {selectedIds.length}개 선택됨
                </p>
              )}
              <ul aria-label="편집 식당">
                {restaurants.map((restaurant) => (
                  <SavedRestaurantRow
                    key={restaurant.id}
                    restaurant={restaurant}
                    editing
                    selection={
                      <Checkbox
                        className={SELECTION_CLASS}
                        aria-label={`${restaurant.name} 선택`}
                        checked={selectedIds.includes(restaurant.id)}
                        disabled={!canEdit}
                        onChange={() =>
                          setSelected((current) =>
                            current.includes(restaurant.id)
                              ? current.filter((id) => id !== restaurant.id)
                              : [...current, restaurant.id],
                          )
                        }
                      />
                    }
                  />
                ))}
              </ul>
              <div aria-hidden="true" className="h-px" ref={loadMoreRef} />
              {listQuery.isFetchingNextPage && (
                <p role="status" className="typo-body-5 text-primary-200 py-3">
                  불러오는 중…
                </p>
              )}
            </>
          )}
          {error && (
            <div className="flex flex-col items-center gap-4 py-8">
              <p role="alert" className="typo-body-4 text-primary-200">
                {getErrorPresentation(error).message}
              </p>
              <Button
                size="sm"
                variant="neutral"
                disabled={detailQuery.isFetching || listQuery.isFetching}
                onClick={() => {
                  if (detailQuery.error || !owned) void detailQuery.refetch()
                  else if (listQuery.isFetchNextPageError)
                    void listQuery.fetchNextPage()
                  else void listQuery.refetch()
                }}
              >
                다시 시도
              </Button>
            </div>
          )}
        </div>
        {owned && (
          <BottomActionBar
            aria-label="컬렉션 식당 편집 액션"
            startAction={
              <Button
                className="w-full min-w-0"
                disabled={!canEdit || !selectedIds.length}
                onClick={() => setDialog('move')}
              >
                이동{selectedIds.length ? ` ${selectedIds.length}` : ''}
              </Button>
            }
            endAction={
              <Button
                className="w-full min-w-0"
                disabled={!canEdit || !selectedIds.length}
                onClick={() => setDialog('remove')}
              >
                삭제{selectedIds.length ? ` ${selectedIds.length}` : ''}
              </Button>
            }
          />
        )}
      </section>
      {canEdit && dialog === 'move' && (
        <CollectionTargetQueryDialog
          mode="move"
          sourceCollectionId={collectionId}
          restaurantIds={selectedIds.map(Number)}
          createState={getCollectionManagementState(location.state, {
            collectionId: String(collectionId),
            type: 'edit',
            restaurantIds: selectedIds,
            dialog: 'move',
          })}
          onMoved={clearCompleted}
          onClose={closeDialog}
        />
      )}
      {canEdit && dialog === 'remove' && (
        <CollectionDeleteQueryDialog
          kind="restaurants"
          collectionId={collectionId}
          restaurantIds={selectedIds.map(Number)}
          onRemoved={clearCompleted}
          onClose={closeDialog}
        />
      )}
    </>
  )
}
