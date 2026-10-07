import { CheckIcon, PlusIcon, SaveIcon } from '@hashi/hds-icons'
import { Button, Dialog } from '@hashi/hds-ui'
import { useId, useState } from 'react'
import { CollectionCover } from '@/pages/saved/components/CollectionCover'
import { CollectionForm } from '@/pages/saved/components/CollectionForm'
import { useCollectionData } from '@/pages/saved/data/useCollectionData'
import {
  createCollection,
  saveRestaurant,
} from '@/pages/saved/utils/collectionMutations'
import {
  selectCollections,
  selectRestaurants,
} from '@/pages/saved/utils/collectionSelectors'
import { cn } from '@/shared/utils'
import type { CollectionData } from '@/pages/saved/types'

// Figma 8317:38858 / 8317:38956: 너비 327, 최대 높이 490, 행 80.
export const CollectionTargetDialog = ({
  data,
  onDataChange,
  onClose,
  title,
  excludeId,
  isDisabled = () => false,
  onConfirm,
  confirmLabel,
  feedback,
}: {
  data: CollectionData
  onDataChange: (data: CollectionData) => void
  onClose: () => void
  title: string
  excludeId?: string
  isDisabled?: (id: string) => boolean
  onConfirm: (id: string) => void
  confirmLabel: (id: string | null) => string
  feedback?: (id: string) => string
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [creationCount, setCreationCount] = useState(0)
  const id = useId()
  const selected = data.collections.find((item) => item.id === selectedId)
  const canSave = Boolean(
    selected && selected.id !== excludeId && !isDisabled(selected.id),
  )

  return (
    <>
      <Dialog.Root
        open={!creating}
        onOpenChange={(open) => {
          if (!open) onClose()
        }}
      >
        <Dialog.Content
          className="max-h-[calc(100dvh-48px)] rounded-[20px] p-6"
          aria-label={title}
        >
          <Dialog.Header className="shrink-0">
            <Dialog.Title>{title}</Dialog.Title>
          </Dialog.Header>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="border-warm-gray-50 mt-3 flex min-h-20 w-full shrink-0 items-center gap-3 border-b text-left"
          >
            <span className="bg-primary-100 flex size-12 shrink-0 items-center justify-center rounded-[5px]">
              <PlusIcon className="text-primary-200 size-8" />
            </span>
            <span className="typo-body-3 text-primary-200">
              새 컬렉션 만들기
            </span>
          </button>
          <Dialog.Body className="max-h-65 min-h-0 overflow-y-auto overscroll-contain">
            <div
              role="radiogroup"
              aria-label={`${title} 대상`}
              onKeyDown={(event) => {
                if (
                  ![
                    'ArrowUp',
                    'ArrowDown',
                    'ArrowLeft',
                    'ArrowRight',
                    'Home',
                    'End',
                  ].includes(event.key)
                )
                  return
                const items = [
                  ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
                    '[role="radio"]:not(:disabled)',
                  ),
                ]
                if (!items.length) return
                event.preventDefault()
                const current = items.indexOf(
                  document.activeElement as HTMLButtonElement,
                )
                const next =
                  event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? items.length - 1
                      : (current +
                          (['ArrowUp', 'ArrowLeft'].includes(event.key)
                            ? -1
                            : 1) +
                          items.length) %
                        items.length
                items[next].focus()
                items[next].click()
              }}
            >
              {selectCollections(data.collections)
                .filter((c) => c.id !== excludeId)
                .map((collection) => {
                  const saved = isDisabled(collection.id)
                  const selected = selectedId === collection.id
                  return (
                    <button
                      key={collection.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={saved}
                      aria-label={`${collection.name}${saved ? ' (저장됨)' : ''}`}
                      onClick={() => setSelectedId(collection.id)}
                      className="border-warm-gray-50 flex min-h-20 w-full items-center gap-3 border-b py-3 text-left focus-visible:outline-2 disabled:cursor-default"
                    >
                      <CollectionCover collection={collection} compact />
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="typo-sub-header-2 text-primary-200 [overflow-wrap:anywhere] break-words">
                          {collection.name}
                        </span>
                        <span className="typo-body-7 text-cool-gray-600 flex items-center">
                          <SaveIcon className="text-warm-gray-100 size-4" />
                          {
                            selectRestaurants(collection, data.restaurants)
                              .length
                          }
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          'flex size-6 shrink-0 items-center justify-center rounded-full border',
                          saved || selected
                            ? 'border-cool-gray-900 bg-cool-gray-900 text-white'
                            : 'border-warm-gray-100 text-warm-gray-100',
                        )}
                      >
                        <CheckIcon className="size-5" />
                      </span>
                    </button>
                  )
                })}
            </div>
          </Dialog.Body>
          {selectedId && feedback?.(selectedId) && (
            <p
              role="status"
              className="typo-body-6 text-primary-200 mt-3 w-full"
            >
              {feedback(selectedId)}
            </p>
          )}
          <Dialog.Footer className="shrink-0">
            <Button size="md" variant="neutral" onClick={onClose}>
              취소
            </Button>
            <Button
              size="md"
              disabled={!canSave}
              onClick={() => {
                if (!canSave || !selectedId) return
                onConfirm(selectedId)
              }}
            >
              {confirmLabel(selectedId)}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
      {creating && (
        <CollectionForm
          collections={data.collections}
          onClose={() => setCreating(false)}
          onSubmit={(draft) => {
            const createdAt = new Date().toISOString()
            onDataChange(
              createCollection(
                data,
                draft,
                `mock-${id}-${creationCount}`,
                createdAt,
              ),
            )
            setCreationCount((count) => count + 1)
            setCreating(false)
          }}
        />
      )}
    </>
  )
}

export const CollectionSaveDialog = ({
  restaurantId,
  onClose,
}: {
  restaurantId: string
  onClose: () => void
}) => {
  const { data, setData } = useCollectionData()
  return (
    <CollectionTargetDialog
      data={data}
      onDataChange={setData}
      onClose={onClose}
      title="컬렉션 저장"
      confirmLabel={() => '저장'}
      isDisabled={(id) =>
        !data.restaurants.some(
          (r) => r.id === restaurantId && r.visibility === 'visible',
        ) ||
        Boolean(
          data.collections
            .find((c) => c.id === id)
            ?.restaurants.some((r) => r.restaurantId === restaurantId),
        )
      }
      onConfirm={(id) => {
        setData((current) =>
          saveRestaurant(current, id, restaurantId, new Date().toISOString()),
        )
        onClose()
      }}
    />
  )
}
