import { CancelIcon, MapViewIcon } from '@hashi/hds-icons'
import { Button, DragPanel, IconButton } from '@hashi/hds-ui'
import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/app/router/path'
import { getCollectionEditPath } from '@/app/router/routePaths'
import { getCollectionFormState } from '@/pages/saved/utils/collectionNavigation'
import { INITIAL_COLLECTION_VIEW } from '@/pages/saved/types'
import type { CollectionData, CollectionViewState } from '@/pages/saved/types'
import { selectRestaurants } from '@/pages/saved/utils/collectionSelectors'
import { CollectionPanelHeader } from '@/pages/saved/components/CollectionPanelHeader'
import { CollectionPanelList } from '@/pages/saved/components/CollectionPanelList'
import { SavedRestaurantRow } from '@/pages/saved/components/SavedRestaurantRow'
import { cn } from '@/shared/utils'

// Figma 8317:40578, 8317:40327. 손잡이 포함, 내비게이션 제외.
const COLLECTION_PANEL_HEIGHT = {
  list: 393,
  detail: 393,
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
  onDataChange?: (data: CollectionData) => void
}

/** 지도 담당자가 내비게이션을 제외한 relative 컨테이너에 배치한다. */
export const CollectionDragPanelContent = ({
  data,
  view,
  onViewChange,
  availableHeight,
  onRestaurantSelect,
  onClose,
  onDataChange,
}: CollectionDragPanelContentProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [panelHost, setPanelHost] = useState<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listOffset = useRef<{
    collectionId: string | null
    top: number
  } | null>(null)
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
  if (panel.collectionId !== view.collectionId) {
    setPanel({ collectionId: view.collectionId, height: normalHeight })
    setMenu(null)
  }
  const height = panel.height
  const restaurants = collection
    ? selectRestaurants(collection, data.restaurants, view.sort, view.category)
    : []

  useLayoutEffect(() => {
    const list = listRef.current
    const scroller = list?.parentElement
    if (!list || !scroller) {
      listOffset.current = null
      return
    }
    const top =
      list.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top +
      scroller.scrollTop
    const previous = listOffset.current
    if (previous?.collectionId === view.collectionId && previous.top !== top) {
      scroller.scrollTop += top - previous.top
    }
    listOffset.current = { collectionId: view.collectionId, top }
  })

  const renderHeader = (isFullscreen: boolean, collapse?: () => void) =>
    collection ? (
      <CollectionPanelHeader
        collection={collection}
        restaurantCount={restaurants.length}
        isFullscreen={isFullscreen}
        onCollapse={collapse}
        view={view}
        onViewChange={onViewChange}
        menu={menu}
        onMenuChange={setMenu}
      />
    ) : null
  return (
    <>
      <div ref={setPanelHost} className="pointer-events-none absolute inset-0">
        <DragPanel
          key={view.collectionId ?? 'list'}
          aria-label="저장 컬렉션 패널"
          handleLabel="컬렉션 패널 높이"
          height={height}
          normalHeight={normalHeight}
          maxHeight={collection ? undefined : COLLECTION_PANEL_HEIGHT.list}
          onHeightChange={(next) => {
            setMenu(null)
            setPanel({ collectionId: view.collectionId, height: next })
          }}
          header={({ isFullscreen, collapse }) =>
            isFullscreen ? renderHeader(true, collapse) : null
          }
          floating={({ isFullscreen, collapse }) =>
            isFullscreen ? (
              <Button
                size="md"
                className="absolute right-5 bottom-5 h-11 gap-0.5 rounded-full px-3 leading-[1.36] shadow-[0_4px_4px_rgba(0,0,0,0.15)]"
                leftIcon={
                  <MapViewIcon className="fill-secondary-200 stroke-primary-100 size-6" />
                }
                onClick={collapse}
              >
                지도로 보기
              </Button>
            ) : collection && panelHost ? (
              createPortal(
                <IconButton
                  aria-label="컬렉션 지도 보기 종료"
                  variant="soft"
                  className="pointer-events-auto absolute left-5 z-10 size-11"
                  style={{
                    bottom: Math.max(
                      0,
                      Math.min(
                        Math.min(height, availableHeight) +
                          COLLECTION_PANEL_HEIGHT.closeGap,
                        availableHeight - COLLECTION_PANEL_HEIGHT.closeSize,
                      ),
                    ),
                  }}
                  onClick={onClose}
                >
                  <CancelIcon className="size-6" />
                </IconButton>,
                panelHost,
              )
            ) : null
          }
        >
          {({ isFullscreen }) => (
            <>
              {!isFullscreen && renderHeader(false)}
              {collection ? (
                <ul
                  ref={listRef}
                  aria-label="저장 식당"
                  className={cn('px-5', isFullscreen && 'pb-20')}
                >
                  {restaurants.map((restaurant) => (
                    <SavedRestaurantRow
                      key={restaurant.id}
                      restaurant={restaurant}
                      onSelect={onRestaurantSelect}
                    />
                  ))}
                </ul>
              ) : (
                <CollectionPanelList
                  data={data}
                  onCreate={
                    onDataChange
                      ? () =>
                          navigate(ROUTES.collectionNew, {
                            state: getCollectionFormState(location),
                          })
                      : undefined
                  }
                  onEdit={
                    onDataChange
                      ? (id) =>
                          navigate(getCollectionEditPath(id), {
                            state: getCollectionFormState(location),
                          })
                      : undefined
                  }
                  onSelect={(collectionId) => {
                    setMenu(null)
                    onViewChange({ ...INITIAL_COLLECTION_VIEW, collectionId })
                  }}
                />
              )}
            </>
          )}
        </DragPanel>
      </div>
    </>
  )
}
