import { BackIcon, CheckIcon, LinkIcon } from '@hashi/hds-icons'
import { Button, Checkbox, Header, IconButton, showToast } from '@hashi/hds-ui'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  getCollectionManagementState,
  getCollectionSaveState,
} from '@/pages/saved/utils/collectionNavigation'
import type { CollectionData, CollectionViewState } from '@/pages/saved/types'
import { BottomActionBar } from '@/shared/components/bottomActionBar/BottomActionBar'
import { CollectionConfirmDialog } from '@/pages/saved/components/CollectionConfirmDialog'
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
  dialog?: 'move' | 'remove'
  restaurantIds?: readonly string[]
}

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
  const location = useLocation()
  const navigate = useNavigate()
  const collection = data.collections.find((c) => c.id === action.collectionId)
  const shareNotified = useRef(false)
  const [selected, setSelected] = useState<readonly string[]>(
    action.restaurantIds ?? [],
  )
  const [dialog, setDialog] = useState<'move' | 'remove' | null>(
    action.type === 'move' || action.type === 'remove'
      ? action.type
      : (action.dialog ?? null),
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
    if (editing) {
      setDialog(null)
      navigate(
        { pathname: location.pathname, search: location.search },
        {
          replace: true,
          state: getCollectionManagementState(
            getCollectionSaveState(location.state, null),
            { ...action, restaurantIds: selectedIds, dialog: undefined },
          ),
        },
      )
    } else onClose()
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
        <section
          aria-label="컬렉션 편집"
          className="app-mobile-bottom-action-content flex h-dvh flex-col overflow-hidden bg-white pt-[var(--safe-area-top,0px)]"
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
          <BottomActionBar
            aria-label="컬렉션 식당 편집 액션"
            startAction={
              <Button
                className="w-full min-w-0"
                disabled={!selectedIds.length}
                onClick={() => setDialog('move')}
              >
                이동{selectedIds.length ? ` ${selectedIds.length}` : ''}
              </Button>
            }
            endAction={
              <Button
                className="w-full min-w-0"
                disabled={!selectedIds.length}
                onClick={() => setDialog('remove')}
              >
                삭제{selectedIds.length ? ` ${selectedIds.length}` : ''}
              </Button>
            }
          />
        </section>
      )}
      {dialog === 'move' && (
        <CollectionTargetDialog
          data={data}
          onClose={closeDialog}
          title="컬렉션 이동"
          createState={getCollectionManagementState(location.state, {
            ...action,
            restaurantIds: selectedIds,
            dialog: 'move',
          })}
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
      <CollectionConfirmDialog
        open={confirmingDelete || sharing || dialog === 'remove'}
        sharing={sharing}
        deletingCollection={confirmingDelete}
        onClose={closeDialog}
        onConfirm={() => {
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
            onDataChange(removeRestaurants(data, collection.id, selectedIds))
            setSelected([])
            closeDialog()
          }
        }}
      />
    </>
  )
}
