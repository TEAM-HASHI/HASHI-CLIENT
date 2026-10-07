import {
  BackIcon,
  CheckIcon,
  LinkIcon,
  NoteIcon,
  OrderCancelIcon,
} from '@hashi/hds-icons'
import {
  Button,
  Checkbox,
  Dialog,
  Header,
  IconButton,
  showToast,
} from '@hashi/hds-ui'
import { useEffect, useRef, useState } from 'react'
import type { CollectionData, CollectionViewState } from '@/pages/saved/types'
import { SavedRestaurantRow } from '@/pages/saved/components/SavedRestaurantRow'
import { CollectionTargetDialog } from '@/pages/saved/components/CollectionSaveDialog'
import { selectRestaurants } from '@/pages/saved/utils/collectionSelectors'
import {
  deleteCollection,
  getMoveSummary,
  moveRestaurants,
  removeRestaurants,
} from '@/pages/saved/utils/collectionManagement'

export type CollectionManagementAction = {
  collectionId: string
  type: 'edit' | 'move' | 'remove' | 'delete' | 'share'
  restaurantIds?: readonly string[]
}

// Figma 8317:39338 / 39425 / 39512. 공통 Checkbox는 페이지 내부에서 원형 24px로 조합한다.
const SELECTION_CLASS =
  'shrink-0 [&>span:first-of-type]:size-6 [&>span:first-of-type]:rounded-full [&>span:first-of-type]:border [&>span:first-of-type]:border-warm-gray-100 [&>span:first-of-type]:bg-white [&>span:first-of-type]:text-warm-gray-100 [&>span:first-of-type>svg]:size-5 [&>input:checked+span]:bg-cool-gray-900 [&>input:checked+span]:border-cool-gray-900 [&>input:checked+span]:text-white'

export const CollectionEditor = ({
  action,
  data,
  onDataChange,
  onClose,
  onDeleted,
  view,
}: {
  action: CollectionManagementAction
  data: CollectionData
  onDataChange: (data: CollectionData) => void
  onClose: () => void
  onDeleted: () => void
  view: CollectionViewState
}) => {
  const collection = data.collections.find((c) => c.id === action.collectionId)
  const shareNotified = useRef(false)
  const [selected, setSelected] = useState<readonly string[]>(
    action.restaurantIds ?? [],
  )
  const [dialog, setDialog] = useState<'move' | 'remove' | null>(
    action.type === 'move' || action.type === 'remove' ? action.type : null,
  )
  const editing = action.type === 'edit'
  const restaurants = collection
    ? selectRestaurants(collection, data.restaurants, view.sort, view.category)
    : []
  const selectedIds = selected.filter((id) =>
    restaurants.some((r) => r.id === id),
  )
  const all =
    restaurants.length > 0 && selectedIds.length === restaurants.length
  const closeDialog = () => {
    if (editing) setDialog(null)
    else onClose()
  }
  useEffect(() => {
    if (
      action.type === 'share' &&
      collection?.isPublic &&
      !shareNotified.current
    ) {
      shareNotified.current = true
      showToast({
        icon: <LinkIcon className="size-6" />,
        children: '링크 복사는 아직 연결되지 않았어요.',
      })
      onClose()
    }
  }, [action.type, collection?.isPublic, onClose])
  if (!collection) return null

  const summary = (target: string) =>
    getMoveSummary(data, collection.id, target, selectedIds)
  const confirmingDelete = action.type === 'delete'
  const sharing = action.type === 'share' && !collection.isPublic
  return (
    <>
      {editing && (
        <Dialog.Root
          open
          onOpenChange={(open) => {
            if (!open) onClose()
          }}
        >
          <Dialog.Content
            aria-label="컬렉션 편집"
            className="h-dvh max-h-dvh w-screen max-w-[var(--app-mobile-max-width,100vw)] rounded-none p-0 pt-[var(--safe-area-top,0px)]"
          >
            <Header
              className="shrink-0"
              title={collection.name}
              subtitle="편집하기"
              contentClassName="[&>div:first-child]:typo-sub-header-2"
              leftAction={
                <IconButton size="xs" aria-label="편집 종료" onClick={onClose}>
                  <BackIcon className="size-6" />
                </IconButton>
              }
            />
            <div className="border-warm-gray-50 flex h-11.5 w-full shrink-0 items-center border-b px-5">
              <Checkbox
                className={SELECTION_CLASS}
                aria-label="전체 선택"
                checked={all}
                disabled={!restaurants.length}
                ref={(node) => {
                  if (node) node.indeterminate = selectedIds.length > 0 && !all
                }}
                onChange={() =>
                  setSelected(all ? [] : restaurants.map((r) => r.id))
                }
              >
                <span className="typo-body-5 text-primary-200">전체 선택</span>
              </Checkbox>
            </div>
            <div className="min-h-0 w-full flex-1 overflow-y-auto overscroll-contain px-5">
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
            </div>
            <div className="flex w-full shrink-0 gap-4 px-5 pt-4 pb-[max(48px,var(--safe-area-bottom,0px))]">
              <Button
                className="min-w-0 flex-1"
                disabled={!selectedIds.length}
                onClick={() => setDialog('move')}
              >
                이동{selectedIds.length ? ` ${selectedIds.length}` : ''}
              </Button>
              <Button
                className="min-w-0 flex-1"
                disabled={!selectedIds.length}
                onClick={() => setDialog('remove')}
              >
                삭제{selectedIds.length ? ` ${selectedIds.length}` : ''}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Root>
      )}
      {dialog === 'move' && (
        <CollectionTargetDialog
          data={data}
          onDataChange={onDataChange}
          onClose={closeDialog}
          title="컬렉션 이동"
          excludeId={collection.id}
          confirmLabel={() => '이동'}
          feedback={(target) =>
            summary(target).duplicate.length
              ? selectedIds.length === 1
                ? '이미 저장된 식당이에요.'
                : `이미 저장된 ${summary(target).duplicate.length}곳은 이동하지 않아요.`
              : ''
          }
          onConfirm={(target) => {
            const { movable } = summary(target)
            if (!movable.length) return
            onDataChange(
              moveRestaurants(
                data,
                collection.id,
                target,
                selectedIds,
                new Date().toISOString(),
              ),
            )
            setSelected((current) =>
              current.filter((id) => !movable.includes(id)),
            )
            closeDialog()
          }}
        />
      )}
      <Dialog.Root
        type="alertdialog"
        open={confirmingDelete || sharing || dialog === 'remove'}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
      >
        <Dialog.Content className="max-h-[calc(100dvh-48px)] min-h-55 justify-center overflow-y-auto rounded-[20px]">
          <Dialog.Header>
            <Dialog.Icon>
              {sharing ? (
                <NoteIcon className="size-6" />
              ) : (
                <OrderCancelIcon className="size-6" />
              )}
            </Dialog.Icon>
            <Dialog.Title>
              {sharing
                ? '공개된 컬렉션만 공유할 수 있어요. 공개로 변경하시겠어요?'
                : '정말 삭제하시겠습니까?'}
            </Dialog.Title>
            {!sharing && (
              <Dialog.Description className="min-h-9.5">
                {confirmingDelete ? (
                  '삭제한 컬렉션은 다시 되돌릴 수 없어요.'
                ) : (
                  <>
                    컬렉션에서 삭제한 장소는
                    <br />
                    다시 되돌릴 수 없어요.
                  </>
                )}
              </Dialog.Description>
            )}
          </Dialog.Header>
          <Dialog.Footer>
            <Button size="md" variant="neutral" onClick={closeDialog}>
              취소하기
            </Button>
            <Button
              size="md"
              onClick={() => {
                if (sharing) {
                  onDataChange({
                    ...data,
                    collections: data.collections.map((c) =>
                      c.id === collection.id ? { ...c, isPublic: true } : c,
                    ),
                  })
                  showToast({
                    icon: <LinkIcon className="size-6" />,
                    children:
                      '공개 컬렉션으로 변경했어요. 링크 복사는 아직 연결되지 않았어요.',
                  })
                  onClose()
                } else if (confirmingDelete) {
                  onDataChange(deleteCollection(data, collection.id))
                  showToast({
                    icon: <CheckIcon className="text-success size-6.5" />,
                    children: '컬렉션이 삭제되었어요.',
                  })
                  onDeleted()
                  onClose()
                } else {
                  onDataChange(
                    removeRestaurants(data, collection.id, selectedIds),
                  )
                  setSelected([])
                  closeDialog()
                }
              }}
            >
              {sharing ? '공개 후 공유' : '삭제하기'}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </>
  )
}
