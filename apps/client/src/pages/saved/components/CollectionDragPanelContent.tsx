import {
  BackIcon,
  MapViewIcon,
  CancelIcon,
  MenuIcon,
  PlusIcon,
  SaveIcon,
  ShareIcon,
} from '@hashi/hds-icons'
import { Button, Dialog, DragPanel, Header, IconButton } from '@hashi/hds-ui'
import { useId, useLayoutEffect, useRef, useState } from 'react'

import { RoutedBottomNavigation } from '@/app/navigation/RoutedBottomNavigation'

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
import {
  CollectionDropdown,
  CollectionEditMenu,
  CollectionActionMenu,
} from '@/pages/saved/components/CollectionDropdown'
import { CollectionForm } from '@/pages/saved/components/CollectionForm'
import {
  createCollection,
  updateCollection,
} from '@/pages/saved/utils/collectionMutations'
import { CollectionListRow } from '@/pages/saved/components/CollectionListRow'
import { SavedRestaurantRow } from '@/pages/saved/components/SavedRestaurantRow'
import { CollectionEditor } from '@/pages/saved/components/CollectionEditor'
import type { CollectionManagementAction } from '@/pages/saved/components/CollectionEditor'

// 목록 318~458px(사용자 확정), 상세 477px(Figma 8317:40117). 모두 내비게이션 포함.
const COLLECTION_PANEL_HEIGHT = {
  listMin: 318,
  listMax: 458,
  detail: 477,
  navigation: 84,
  handle: 30,
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
  const id = useId()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const panelHostRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const scrollPositions = useRef(new Map<string, number>())
  const collapsedScrollTop = useRef<number | null>(null)
  const shouldRestoreFocus = useRef(false)
  const viewKey = view.collectionId ?? 'list'
  useLayoutEffect(() => {
    const scroller = contentRef.current?.parentElement
    if (scroller) scroller.scrollTop = scrollPositions.current.get(viewKey) ?? 0
    if (!isFullscreen && shouldRestoreFocus.current) {
      const frame = requestAnimationFrame(() => {
        panelHostRef.current
          ?.querySelector<HTMLElement>('[role="slider"]')
          ?.focus()
        shouldRestoreFocus.current = false
      })
      return () => cancelAnimationFrame(frame)
    }
  }, [isFullscreen, viewKey])
  const [creationCount, setCreationCount] = useState(0)
  const [form, setForm] = useState<'create' | { id: string } | null>(null)
  const [management, setManagement] =
    useState<CollectionManagementAction | null>(null)
  const collection = data.collections.find(
    (item) => item.id === view.collectionId,
  )
  const listContentRef = useRef<HTMLDivElement>(null)
  const [listContentHeight, setListContentHeight] = useState(0)
  const isList = !collection
  useLayoutEffect(() => {
    const content = listContentRef.current
    if (!content || isFullscreen) return
    const measure = () =>
      setListContentHeight(content.getBoundingClientRect().height)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(content)
    return () => observer.disconnect()
  }, [isList, isFullscreen])
  const normalHeight = collection
    ? COLLECTION_PANEL_HEIGHT.detail - COLLECTION_PANEL_HEIGHT.navigation
    : Math.min(
        COLLECTION_PANEL_HEIGHT.listMax - COLLECTION_PANEL_HEIGHT.navigation,
        Math.max(
          COLLECTION_PANEL_HEIGHT.listMin - COLLECTION_PANEL_HEIGHT.navigation,
          listContentHeight + COLLECTION_PANEL_HEIGHT.handle,
        ),
      )
  const [panel, setPanel] = useState<{
    collectionId: string | null
    height: number
  } | null>(null)
  const [menu, setMenu] = useState<'sort' | 'category' | null>(null)
  const maxHeight = Math.max(
    0,
    availableHeight - COLLECTION_PANEL_HEIGHT.topGap,
  )
  const height =
    panel?.collectionId === view.collectionId ? panel.height : normalHeight
  const restaurants = collection
    ? selectRestaurants(collection, data.restaurants, view.sort, view.category)
    : []
  const isEditingFullscreen =
    isFullscreen && (Boolean(form) || management?.type === 'edit')

  const handleReturnToMap = () => {
    setMenu(null)
    setPanel(null)
    collapsedScrollTop.current = null
    shouldRestoreFocus.current = true
    setIsFullscreen(false)
  }
  const content = (
    <div ref={contentRef}>
      {collection ? (
        <>
          <div className="sticky top-0 z-10 bg-white">
            <div className={isFullscreen ? 'bg-white' : 'px-5 pt-1.5'}>
              <div
                className={isFullscreen ? 'relative' : 'flex items-start gap-3'}
              >
                {isFullscreen && (
                  <Header
                    title={
                      <h1
                        className="max-w-full truncate"
                        title={collection.name}
                      >
                        {collection.name}
                      </h1>
                    }
                    subtitle="저장한 장소"
                    contentClassName="inset-x-20 [&>div:first-child]:typo-sub-header-2"
                    leftAction={
                      <IconButton
                        size="xs"
                        aria-label="지도로 돌아가기"
                        onClick={handleReturnToMap}
                      >
                        <BackIcon className="size-6" />
                      </IconButton>
                    }
                  />
                )}
                <h2
                  hidden={isFullscreen}
                  className="typo-sub-header-1 text-primary-200 min-w-0 flex-1 [overflow-wrap:anywhere] break-words"
                >
                  {collection.name}
                </h2>
                <div
                  className={
                    isFullscreen
                      ? 'absolute top-7 right-5 flex items-center gap-1'
                      : 'flex items-center gap-3'
                  }
                >
                  {onDataChange ? (
                    <>
                      {!isFullscreen && (
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
                      )}
                      <CollectionActionMenu
                        label="컬렉션 더보기"
                        onManage={() =>
                          setManagement({
                            collectionId: collection.id,
                            type: 'edit',
                          })
                        }
                        onShare={
                          isFullscreen
                            ? () =>
                                setManagement({
                                  collectionId: collection.id,
                                  type: 'share',
                                })
                            : undefined
                        }
                        onDelete={() =>
                          setManagement({
                            collectionId: collection.id,
                            type: 'delete',
                          })
                        }
                      />
                    </>
                  ) : (
                    <MenuIcon
                      aria-hidden="true"
                      className="text-warm-gray-300 size-4.5 shrink-0"
                    />
                  )}
                </div>
              </div>
              {!isFullscreen && collection.description && (
                <p className="typo-body-6 text-cool-gray-400 mt-2 [overflow-wrap:anywhere] break-words whitespace-pre-wrap">
                  {collection.description}
                </p>
              )}
            </div>
            <div
              className={
                isFullscreen
                  ? 'flex h-11.5 items-center justify-between gap-2 bg-white px-5'
                  : 'flex items-center justify-between gap-2 px-5 py-4'
              }
            >
              <span className="typo-body-6 text-cool-gray-600 flex items-center gap-0.5">
                {isFullscreen ? (
                  '총 '
                ) : (
                  <SaveIcon
                    aria-hidden="true"
                    className="text-warm-gray-100 size-4"
                  />
                )}
                {restaurants.length}
                {isFullscreen ? '곳' : ''}
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
          </div>
          <ul aria-label="저장 식당" className="px-5">
            {restaurants.map((restaurant) => (
              <SavedRestaurantRow
                key={restaurant.id}
                restaurant={restaurant}
                onSelect={(restaurantId) => {
                  if (isFullscreen) handleReturnToMap()
                  onRestaurantSelect(restaurantId)
                }}
                moreAction={
                  onDataChange && (
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
                  )
                }
              />
            ))}
          </ul>
        </>
      ) : (
        <div ref={listContentRef}>
          <div className="sticky top-0 z-10 bg-white">
            {isFullscreen && (
              <Header
                title="저장 컬렉션"
                leftAction={
                  <IconButton
                    size="xs"
                    aria-label="지도로 돌아가기"
                    onClick={handleReturnToMap}
                  >
                    <BackIcon className="size-6" />
                  </IconButton>
                }
              />
            )}
            <div className="flex items-center justify-between px-5 pt-2 pb-1">
              <h2
                className={
                  isFullscreen
                    ? 'typo-body-5 text-primary-200'
                    : 'typo-body-3 text-primary-200'
                }
              >
                {isFullscreen ? '총 ' : '컬렉션 '}
                <span className={isFullscreen ? undefined : 'font-semibold'}>
                  {data.collections.length}
                </span>
                개
              </h2>
            </div>
            <div className="px-5">
              <button
                type="button"
                disabled={!onDataChange}
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
            </div>
          </div>
          <div className="px-5">
            <ul
              aria-label="저장 컬렉션"
              className={isFullscreen ? 'flex flex-col gap-4 pt-4' : undefined}
            >
              {selectCollections(data.collections).map((item) => (
                <CollectionListRow
                  key={item.id}
                  compact={!isFullscreen}
                  collection={item}
                  moreAction={
                    onDataChange ? (
                      <CollectionEditMenu
                        name={item.name}
                        context={isFullscreen ? 'page' : 'panel'}
                        onEdit={() => setForm({ id: item.id })}
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
                      />
                    ) : undefined
                  }
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
        </div>
      )}
    </div>
  )
  const editors = (
    <>
      {form && onDataChange && (
        <CollectionForm
          collections={data.collections}
          collection={
            form === 'create'
              ? undefined
              : data.collections.find((item) => item.id === form.id)
          }
          onClose={() => setForm(null)}
          onSubmit={(draft) => {
            if (form === 'create') {
              onDataChange(
                createCollection(
                  data,
                  draft,
                  `mock-${id}-${creationCount}`,
                  new Date().toISOString(),
                ),
              )
              setCreationCount((count) => count + 1)
            } else onDataChange(updateCollection(data, form.id, draft))
            setForm(null)
          }}
        />
      )}
      {management && onDataChange && (
        <CollectionEditor
          action={management}
          data={data}
          onDataChange={onDataChange}
          view={view}
          onClose={() => setManagement(null)}
          onDeleted={() => onViewChange(INITIAL_COLLECTION_VIEW)}
        />
      )}
    </>
  )

  return (
    <div
      ref={panelHostRef}
      onScrollCapture={(event) => {
        if (
          collapsedScrollTop.current === null &&
          event.target instanceof HTMLElement &&
          event.target === contentRef.current?.parentElement
        )
          scrollPositions.current.set(viewKey, event.target.scrollTop)
      }}
      onTransitionEndCapture={(event) => {
        if (
          event.propertyName !== 'height' ||
          !(event.target instanceof HTMLElement) ||
          event.target.getAttribute('aria-label') !== '저장 컬렉션 패널' ||
          height <= COLLECTION_PANEL_HEIGHT.handle ||
          collapsedScrollTop.current === null
        )
          return
        const scroller = contentRef.current?.parentElement
        scroller?.scrollTo({ top: collapsedScrollTop.current })
        collapsedScrollTop.current = null
      }}
    >
      {!isFullscreen && collection && (
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
      {!isFullscreen && (
        <DragPanel
          key={view.collectionId ?? 'list'}
          aria-label="저장 컬렉션 패널"
          handleLabel="컬렉션 패널 높이"
          height={height}
          normalHeight={normalHeight}
          maxHeight={maxHeight}
          onStageCommit={({ stage }) => {
            if (stage === 'maximum') {
              setMenu(null)
              setIsFullscreen(true)
            }
          }}
          onHeightChange={(next) => {
            setMenu(null)
            if (next <= COLLECTION_PANEL_HEIGHT.handle && height > next) {
              collapsedScrollTop.current =
                contentRef.current?.parentElement?.scrollTop ?? 0
            }
            setPanel({ collectionId: view.collectionId, height: next })
          }}
        >
          {content}
        </DragPanel>
      )}
      <Dialog.Root
        open={isFullscreen}
        onOpenChange={(open) => {
          if (!open) handleReturnToMap()
        }}
      >
        <Dialog.Content
          aria-label="컬렉션 전체 화면"
          className="relative h-dvh max-h-dvh w-screen max-w-[var(--app-mobile-max-width,100vw)] items-stretch rounded-none p-0 pt-[var(--safe-area-top,0px)]"
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-20 [@media(max-height:500px)]:pb-4">
            {isFullscreen && content}
          </div>
          {!isEditingFullscreen && (
            <>
              <div className="pointer-events-none absolute right-5 bottom-[calc(100px+var(--safe-area-bottom,0px))] [@media(max-height:500px)]:static [@media(max-height:500px)]:flex [@media(max-height:500px)]:shrink-0 [@media(max-height:500px)]:justify-end [@media(max-height:500px)]:px-5 [@media(max-height:500px)]:py-2">
                <Button
                  size="md"
                  className="pointer-events-auto h-11 rounded-full px-3 shadow-[0_4px_4px_rgba(0,0,0,0.15)]"
                  leftIcon={
                    <MapViewIcon className="fill-secondary-200 stroke-primary-100 size-6" />
                  }
                  onClick={handleReturnToMap}
                >
                  지도로 보기
                </Button>
              </div>
              <RoutedBottomNavigation
                className="h-[calc(84px+var(--safe-area-bottom,0px))] shrink-0 pb-[calc(10px+var(--safe-area-bottom,0px))]"
                onNavigate={handleReturnToMap}
              />
            </>
          )}
          {isFullscreen && editors}
        </Dialog.Content>
      </Dialog.Root>
      {!isFullscreen && editors}
    </div>
  )
}
