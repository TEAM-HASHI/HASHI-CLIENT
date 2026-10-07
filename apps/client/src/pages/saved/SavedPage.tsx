import { BackIcon, MapIcon, ShareIcon, PlusIcon } from '@hashi/hds-icons'
import { Button, Header, IconButton } from '@hashi/hds-ui'
import { useId, useLayoutEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'

import {
  CollectionDropdown,
  CollectionEditMenu,
  CollectionActionMenu,
} from '@/pages/saved/components/CollectionDropdown'
import { CollectionForm } from '@/pages/saved/components/CollectionForm'
import { useCollectionData } from '@/pages/saved/data/useCollectionData'
import {
  createCollection,
  updateCollection,
} from '@/pages/saved/utils/collectionMutations'
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
  const id = useId()
  const [creationCount, setCreationCount] = useState(0)
  const [form, setForm] = useState<'create' | { id: string } | null>(null)
  const [management, setManagement] =
    useState<CollectionManagementAction | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const [view, setView] = useState<CollectionViewState>(() =>
    isCollectionMapState(location.state)
      ? location.state
      : INITIAL_COLLECTION_VIEW,
  )
  const [menu, setMenu] = useState<'sort' | 'category' | null>(null)
  const collection = data.collections.find(
    (item) => item.id === view.collectionId,
  )
  const restaurants = collection
    ? selectRestaurants(collection, data.restaurants, view.sort, view.category)
    : []

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [view.collectionId])

  return (
    <>
      <div className="app-mobile-bottom-nav-content bg-white pt-[var(--safe-area-top,0px)]">
        <div className="sticky top-0 z-10 bg-white">
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
                      setView(INITIAL_COLLECTION_VIEW)
                      setMenu(null)
                    }}
                  >
                    <BackIcon className="size-6" />
                  </IconButton>
                ) : undefined
              }
              contentClassName={
                collection
                  ? '[&>div:first-child]:typo-sub-header-2 inset-x-20'
                  : undefined
              }
            />
            {collection && (
              <div className="absolute top-7 right-3 flex items-center gap-1">
                <IconButton
                  size="xs"
                  aria-label="컬렉션 공유"
                  onClick={() =>
                    setManagement({
                      collectionId: collection.id,
                      type: 'share',
                    })
                  }
                >
                  <ShareIcon className="size-6" />
                </IconButton>
                <CollectionActionMenu
                  label="컬렉션 더보기"
                  onManage={() =>
                    setManagement({ collectionId: collection.id, type: 'edit' })
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
            ) : (
              <span className="typo-body-6 text-cool-gray-600">최신순</span>
            )}
          </div>
        </div>
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
                className="pointer-events-auto h-11 rounded-full px-3"
                leftIcon={<MapIcon className="size-6" />}
                onClick={() => {
                  const state: CollectionMapState = {
                    ...view,
                    collectionId: collection.id,
                  }
                  navigate(ROUTES.saved, { replace: true, state })
                  navigate(ROUTES.map, { state })
                }}
              >
                지도로 보기
              </Button>
            </div>
          </>
        ) : (
          <div className="px-5">
            <button
              type="button"
              onClick={() => setForm('create')}
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
            <ul aria-label="저장 컬렉션" className="flex flex-col gap-4 pt-4">
              {selectCollections(data.collections).map((item) => (
                <CollectionListRow
                  key={item.id}
                  collection={item}
                  moreAction={
                    <CollectionEditMenu
                      name={item.name}
                      onEdit={() => setForm({ id: item.id })}
                      onShare={() =>
                        setManagement({ collectionId: item.id, type: 'share' })
                      }
                      onDelete={() =>
                        setManagement({ collectionId: item.id, type: 'delete' })
                      }
                    />
                  }
                  restaurantCount={
                    selectRestaurants(item, data.restaurants).length
                  }
                  onSelect={() =>
                    setView({
                      ...INITIAL_COLLECTION_VIEW,
                      collectionId: item.id,
                    })
                  }
                />
              ))}
            </ul>
          </div>
        )}
      </div>
      {form && (
        <CollectionForm
          collection={
            form === 'create'
              ? undefined
              : data.collections.find((item) => item.id === form.id)
          }
          collections={data.collections}
          onClose={() => setForm(null)}
          onSubmit={(draft) => {
            if (form === 'create') {
              const createdAt = new Date().toISOString()
              setData((current) =>
                createCollection(
                  current,
                  draft,
                  `mock-${id}-${creationCount}`,
                  createdAt,
                ),
              )
              setCreationCount((count) => count + 1)
            } else
              setData((current) => updateCollection(current, form.id, draft))
            setForm(null)
          }}
        />
      )}
      {management && (
        <CollectionEditor
          action={management}
          data={data}
          onDataChange={setData}
          view={view}
          onClose={() => setManagement(null)}
          onDeleted={() => setView(INITIAL_COLLECTION_VIEW)}
        />
      )}
    </>
  )
}
