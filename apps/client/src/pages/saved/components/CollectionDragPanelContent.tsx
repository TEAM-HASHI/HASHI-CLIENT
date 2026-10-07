import { CancelIcon, MenuIcon, PlusIcon, SaveIcon } from '@hashi/hds-icons'
import { DragPanel, IconButton } from '@hashi/hds-ui'
import { useState } from 'react'

import {
  COLLECTION_CATEGORY_OPTIONS,
  COLLECTION_SORT_OPTIONS,
  INITIAL_COLLECTION_VIEW,
} from '@/pages/saved/types'
import type { CollectionData, CollectionViewState } from '@/pages/saved/types'
import {
  selectCollections,
  selectRestaurants,
} from '@/pages/saved/utils/collectionSelectors'
import { CollectionDropdown } from '@/pages/saved/components/CollectionDropdown'
import { CollectionListRow } from '@/pages/saved/components/CollectionListRow'
import { SavedRestaurantRow } from '@/pages/saved/components/SavedRestaurantRow'

// Figma 8317:37386 / 8317:40088. 손잡이 포함, 내비게이션 제외.
const COLLECTION_PANEL_HEIGHT = {
  list: 234,
  detail: 393,
  topGap: 12,
  closeGap: 20,
  closeSize: 44,
} as const

export type CollectionDragPanelContentProps = {
  data: CollectionData
  view: CollectionViewState
  onViewChange: (view: CollectionViewState) => void
  availableHeight: number
  onRestaurantSelect: (restaurantId: string) => void
  onClose: () => void
}

/** 지도 담당자가 내비게이션을 제외한 relative 컨테이너에 배치한다. */
export const CollectionDragPanelContent = ({
  data,
  view,
  onViewChange,
  availableHeight,
  onRestaurantSelect,
  onClose,
}: CollectionDragPanelContentProps) => {
  const collection = data.collections.find(
    (item) => item.id === view.collectionId,
  )
  const normalHeight = collection
    ? COLLECTION_PANEL_HEIGHT.detail
    : COLLECTION_PANEL_HEIGHT.list
  const [panel, setPanel] = useState<{
    collectionId: string | null
    height: number
  }>({
    collectionId: view.collectionId,
    height: normalHeight,
  })
  const [menu, setMenu] = useState<'sort' | 'category' | null>(null)
  const maxHeight = Math.max(
    0,
    availableHeight - COLLECTION_PANEL_HEIGHT.topGap,
  )
  const height =
    panel.collectionId === view.collectionId ? panel.height : normalHeight
  const restaurants = collection
    ? selectRestaurants(collection, data.restaurants, view.sort, view.category)
    : []

  return (
    <>
      {collection && (
        <IconButton
          aria-label="컬렉션 지도 보기 종료"
          variant="soft"
          className="absolute left-5 z-10 size-11"
          style={{
            bottom: Math.max(
              0,
              Math.min(
                Math.min(height, maxHeight) + COLLECTION_PANEL_HEIGHT.closeGap,
                availableHeight - COLLECTION_PANEL_HEIGHT.closeSize,
              ),
            ),
          }}
          onClick={onClose}
        >
          <CancelIcon className="size-6" />
        </IconButton>
      )}
      <DragPanel
        aria-label="저장 컬렉션 패널"
        handleLabel="컬렉션 패널 높이"
        height={height}
        normalHeight={normalHeight}
        maxHeight={maxHeight}
        onHeightChange={(next) => {
          setMenu(null)
          setPanel({ collectionId: view.collectionId, height: next })
        }}
      >
        {collection ? (
          <>
            <div className="px-5 pt-1.5">
              <div className="flex items-start gap-3">
                <h2 className="typo-sub-header-1 text-primary-200 min-w-0 flex-1 [overflow-wrap:anywhere] break-words">
                  {collection.name}
                </h2>
                <MenuIcon
                  aria-hidden="true"
                  className="text-warm-gray-300 size-4.5 shrink-0"
                />
              </div>
              {collection.description && (
                <p className="typo-body-6 text-cool-gray-400 mt-2 [overflow-wrap:anywhere] break-words whitespace-pre-wrap">
                  {collection.description}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 px-5 py-4">
              <span className="typo-body-6 text-cool-gray-600 flex items-center gap-0.5">
                <SaveIcon
                  aria-hidden="true"
                  className="text-warm-gray-100 size-4"
                />
                {restaurants.length}
              </span>
              <div className="flex items-center gap-3.75">
                <CollectionDropdown
                  label="정렬"
                  options={COLLECTION_SORT_OPTIONS}
                  value={view.sort}
                  open={menu === 'sort'}
                  onOpenChange={(open) => setMenu(open ? 'sort' : null)}
                  onChange={(sort) => onViewChange({ ...view, sort })}
                />
                <CollectionDropdown
                  label="분류"
                  options={COLLECTION_CATEGORY_OPTIONS}
                  value={view.category}
                  open={menu === 'category'}
                  onOpenChange={(open) => setMenu(open ? 'category' : null)}
                  onChange={(category) => onViewChange({ ...view, category })}
                />
              </div>
            </div>
            <ul aria-label="저장 식당" className="px-5">
              {restaurants.map((restaurant) => (
                <SavedRestaurantRow
                  key={restaurant.id}
                  restaurant={restaurant}
                  onSelect={onRestaurantSelect}
                />
              ))}
            </ul>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 pt-2 pb-1">
              <h2 className="typo-body-3 text-primary-200">
                컬렉션{' '}
                <span className="font-semibold">{data.collections.length}</span>
                개
              </h2>
              <span className="typo-body-6 text-cool-gray-600">최신순</span>
            </div>
            <div className="px-5">
              <button
                type="button"
                disabled
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
              <ul aria-label="저장 컬렉션">
                {selectCollections(data.collections).map((item) => (
                  <CollectionListRow
                    key={item.id}
                    compact
                    collection={item}
                    restaurantCount={
                      selectRestaurants(item, data.restaurants).length
                    }
                    onSelect={() => {
                      setMenu(null)
                      onViewChange({
                        ...INITIAL_COLLECTION_VIEW,
                        collectionId: item.id,
                      })
                    }}
                  />
                ))}
              </ul>
            </div>
          </>
        )}
      </DragPanel>
    </>
  )
}
