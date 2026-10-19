import { BackIcon, MapViewIcon, PlusIcon } from '@hashi/hds-icons'
import { Button, Header, IconButton } from '@hashi/hds-ui'
import { useState } from 'react'
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import {
  getCollectionDetailPath,
  getCollectionEditPath,
  getCollectionRestaurantEditPath,
} from '@/app/router/routePaths'
import {
  getCollectionFormState,
  getCollectionManagementAction,
  getCollectionManagementState,
  getCollectionSaveState,
} from '@/pages/saved/utils/collectionNavigation'

import {
  CollectionDropdown,
  CollectionEditMenu,
  CollectionActionMenu,
} from '@/pages/saved/components/CollectionDropdown'
import { useCollectionData } from '@/pages/saved/data/useCollectionData'
import { CollectionListRow } from '@/pages/saved/components/CollectionListRow'
import { SavedRestaurantRow } from '@/pages/saved/components/SavedRestaurantRow'
import {
  COLLECTION_CATEGORY_OPTIONS,
  COLLECTION_SORT_OPTIONS,
  INITIAL_COLLECTION_VIEW,
} from '@/pages/saved/types'
import type {
  CollectionMapState,
  CollectionViewState,
} from '@/pages/saved/types'
import {
  selectCollections,
  selectRestaurants,
} from '@/pages/saved/utils/collectionSelectors'
import { isCollectionMapState } from '@/pages/saved/utils/collectionMapState'

import { CollectionEditor } from '@/pages/saved/components/CollectionEditor'
import type { CollectionManagementAction } from '@/pages/saved/components/CollectionEditor'

export type SavedPageProps = {
  onRestaurantSelect?: (restaurantId: string) => void
}

export const SavedPage = ({ onRestaurantSelect }: SavedPageProps) => {
  const { data, setData } = useCollectionData()
  const navigate = useNavigate()
  const location = useLocation()
  const [management, setManagement] =
    useState<CollectionManagementAction | null>(() =>
      getCollectionManagementAction(location.state),
    )
  const closeManagement = () => {
    setManagement(null)
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
  const { collectionId } = useParams<{ collectionId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const restored = isCollectionMapState(location.state)
    ? location.state
    : INITIAL_COLLECTION_VIEW
  const view: CollectionViewState = {
    collectionId: collectionId ?? null,
    sort:
      COLLECTION_SORT_OPTIONS.find(
        (item) => item.value === searchParams.get('sort'),
      )?.value ?? restored.sort,
    category:
      COLLECTION_CATEGORY_OPTIONS.find(
        (item) => item.value === searchParams.get('category'),
      )?.value ?? restored.category,
  }
  const setView = (
    change: (current: CollectionViewState) => CollectionViewState,
  ) => {
    const next = change(view)
    setSearchParams(
      { sort: next.sort, category: next.category },
      { replace: true, state: next },
    )
  }
  const [menu, setMenu] = useState<'sort' | 'category' | null>(null)
  const collection = data.collections.find(
    (item) => item.id === view.collectionId,
  )
  const restaurants = collection
    ? selectRestaurants(collection, data.restaurants, view.sort, view.category)
    : []

  if (collectionId && !collection) return <Navigate to={ROUTES.saved} replace />

  return (
    <>
      <div className="flex h-[calc(100dvh-84px-var(--safe-area-bottom,0px))] flex-col overflow-hidden bg-white pt-[var(--safe-area-top,0px)]">
        <div
          data-testid="saved-fixed-header"
          className="relative z-10 shrink-0 bg-white"
        >
          <div className="relative">
            <Header
              title={
                <h1 className="max-w-full truncate" title={collection?.name}>
                  {collection?.name ?? '저장 컬렉션'}
                </h1>
              }
              subtitle={collection ? '저장한 장소' : undefined}
              leftAction={
                collection ? (
                  <IconButton
                    size="xs"
                    aria-label="컬렉션 목록으로 돌아가기"
                    onClick={() => {
                      navigate(ROUTES.saved)
                      setMenu(null)
                    }}
                  >
                    <BackIcon className="size-6" />
                  </IconButton>
                ) : undefined
              }
              contentClassName={
                collection ? '[&>div:first-child]:typo-sub-header-2' : undefined
              }
            />
            {collection && (
              <div className="absolute top-7 right-5 flex items-center gap-1">
                <CollectionActionMenu
                  label="컬렉션 더보기"
                  onManage={() =>
                    navigate(
                      `${getCollectionRestaurantEditPath(collection.id)}?${new URLSearchParams({ sort: view.sort, category: view.category })}`,
                      { state: { collectionEditorReturnKey: location.key } },
                    )
                  }
                  onShare={() =>
                    setManagement({
                      collectionId: collection.id,
                      type: 'share',
                    })
                  }
                  onDelete={() =>
                    setManagement({
                      collectionId: collection.id,
                      type: 'delete',
                    })
                  }
                />
              </div>
            )}
          </div>
          <div className="flex h-11.5 items-center justify-between gap-2 px-5">
            <p className="typo-body-5 text-primary-200 shrink-0">
              총 {collection ? restaurants.length : data.collections.length}
              {collection ? '곳' : '개'}
            </p>
            {collection ? (
              <div className="flex items-center gap-3.75">
                <CollectionDropdown
                  label="정렬"
                  options={COLLECTION_SORT_OPTIONS}
                  value={view.sort}
                  open={menu === 'sort'}
                  onOpenChange={(open) => setMenu(open ? 'sort' : null)}
                  onChange={(sort) =>
                    setView((current) => ({ ...current, sort }))
                  }
                />
                <CollectionDropdown
                  label="분류"
                  options={COLLECTION_CATEGORY_OPTIONS}
                  value={view.category}
                  open={menu === 'category'}
                  onOpenChange={(open) => setMenu(open ? 'category' : null)}
                  onChange={(category) =>
                    setView((current) => ({ ...current, category }))
                  }
                />
              </div>
            ) : null}
          </div>
          {!collection && (
            <div className="px-5">
              <button
                type="button"
                onClick={() =>
                  navigate(ROUTES.collectionNew, {
                    state: getCollectionFormState(location),
                  })
                }
                className="border-warm-gray-50 flex w-full items-center gap-3 border-b py-4.5 text-left"
              >
                <span className="bg-primary-100 flex size-12.5 shrink-0 items-center justify-center rounded-[5px]">
                  <PlusIcon
                    aria-hidden="true"
                    className="text-primary-200 size-8 shrink-0"
                  />
                </span>
                <span className="typo-body-3 text-primary-200">
                  새 컬렉션 만들기
                </span>
              </button>
            </div>
          )}
        </div>
        <section
          key={collectionId ?? 'list'}
          aria-label={collection ? '저장 식당 목록' : '컬렉션 목록'}
          tabIndex={0}
          className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
        >
          {collection ? (
            <>
              <ul aria-label="저장 식당" className="px-5 pb-20">
                {restaurants.map((restaurant) => (
                  <SavedRestaurantRow
                    key={restaurant.id}
                    restaurant={restaurant}
                    onSelect={onRestaurantSelect}
                    moreAction={
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
                    }
                  />
                ))}
              </ul>
              <div className="app-mobile-fixed-bottom pointer-events-none bottom-[calc(100px+var(--safe-area-bottom,0px))] z-10 flex justify-end px-5">
                <Button
                  size="md"
                  className="pointer-events-auto h-11 gap-0.5 rounded-full px-3 shadow-[0_4px_4px_rgba(0,0,0,0.15)]"
                  leftIcon={
                    <MapViewIcon className="fill-secondary-200 stroke-primary-100 size-6" />
                  }
                  onClick={() => {
                    const state: CollectionMapState = {
                      ...view,
                      collectionId: collection.id,
                    }
                    navigate(ROUTES.map, { state })
                  }}
                >
                  지도로 보기
                </Button>
              </div>
            </>
          ) : (
            <div className="px-5">
              <ul aria-label="저장 컬렉션" className="flex flex-col gap-4 py-4">
                {selectCollections(data.collections).map((item) => (
                  <CollectionListRow
                    key={item.id}
                    collection={item}
                    moreAction={
                      <CollectionEditMenu
                        name={item.name}
                        onShare={() =>
                          setManagement({
                            collectionId: item.id,
                            type: 'share',
                          })
                        }
                        onDelete={() =>
                          setManagement({
                            collectionId: item.id,
                            type: 'delete',
                          })
                        }
                        onEdit={() =>
                          navigate(getCollectionEditPath(item.id), {
                            state: getCollectionFormState(location),
                          })
                        }
                      />
                    }
                    restaurantCount={
                      selectRestaurants(item, data.restaurants).length
                    }
                    onSelect={() => navigate(getCollectionDetailPath(item.id))}
                  />
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
      {management && (
        <CollectionEditor
          action={management}
          data={data}
          onDataChange={setData}
          view={view}
          onClose={closeManagement}
          onDeleted={() => navigate(ROUTES.saved, { replace: true })}
        />
      )}
    </>
  )
}
