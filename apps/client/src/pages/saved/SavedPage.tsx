import { MapViewIcon } from '@hashi/hds-icons'
import { Button } from '@hashi/hds-ui'
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
  getRestaurantDetailPath,
  getCollectionDetailPath,
  getCollectionEditPath,
  getCollectionRestaurantEditPath,
} from '@/app/router/routePaths'
import {
  getCollectionFormState,
  getCollectionManagementAction,
  getCollectionManagementState,
  getCollectionSaveState,
} from '@/features/collection/utils/collectionNavigation'

import {
  CollectionDropdown,
  CollectionEditMenu,
  CollectionActionMenu,
} from '@/pages/saved/components/CollectionDropdown'
import { useCollectionData } from '@/pages/saved/data/useCollectionData'
import { CollectionListRow } from '@/pages/saved/components/CollectionListRow'
import { SavedRestaurantRow } from '@/pages/saved/components/SavedRestaurantRow'
import { SavedPageLayout } from '@/pages/saved/components/SavedPageLayout'
import {
  COLLECTION_CATEGORY_OPTIONS,
  COLLECTION_SORT_OPTIONS,
  INITIAL_COLLECTION_VIEW,
} from '@/features/collection/types'
import type {
  CollectionMapState,
  CollectionViewState,
} from '@/features/collection/types'
import {
  selectCollections,
  selectRestaurants,
} from '@/pages/saved/utils/collectionSelectors'
import { isCollectionMapState } from '@/features/collection/utils/collectionMapState'
import { createListReturnStore, useListReturnRestoration } from '@/shared/hooks'

import { CollectionEditor } from '@/pages/saved/components/CollectionEditor'
import type { CollectionManagementAction } from '@/features/collection/types'

const restaurantDetailReturnStore = createListReturnStore<null>()

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

  const { scrollRef, capture } = useListReturnRestoration({
    locationKey: location.key,
    ready: Boolean(collection),
    store: restaurantDetailReturnStore,
  })
  const handleRestaurantSelect = (restaurantId: string) => {
    capture(null)
    navigate(getRestaurantDetailPath(restaurantId))
  }

  if (collectionId && !collection) return <Navigate to={ROUTES.saved} replace />

  return (
    <>
      <SavedPageLayout
        detail={Boolean(collection)}
        title={collection?.name}
        count={collection ? restaurants.length : data.collections.length}
        onBack={() => {
          navigate(ROUTES.saved)
          setMenu(null)
        }}
        onCreate={() =>
          navigate(ROUTES.collectionNew, {
            state: getCollectionFormState(location),
          })
        }
        headerActions={
          collection && (
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
          )
        }
        filters={
          collection && (
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
          )
        }
        scrollRef={scrollRef}
        scrollKey={collectionId ?? 'list'}
      >
        {collection ? (
          <>
            <ul aria-label="저장 식당" className="px-5 pb-20">
              {restaurants.map((restaurant) => (
                <SavedRestaurantRow
                  key={restaurant.id}
                  restaurant={restaurant}
                  onSelect={onRestaurantSelect ?? handleRestaurantSelect}
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
      </SavedPageLayout>
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
