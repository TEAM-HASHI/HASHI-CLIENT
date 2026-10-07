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

// Figma 8317:38858 / 8317:38956: 너비 327, 최대 높이 490, 행 80.
export const CollectionSaveDialog = ({
  restaurantId,
  onClose,
}: {
  restaurantId: string
  onClose: () => void
}) => {
  const { data, setData } = useCollectionData()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [creationCount, setCreationCount] = useState(0)
  const id = useId()
  const selected = data.collections.find((item) => item.id === selectedId)
  const isSaved = (collectionId: string) =>
    data.collections
      .find((item) => item.id === collectionId)
      ?.restaurants.some((item) => item.restaurantId === restaurantId) ?? false
  const canSave = Boolean(
    selected &&
    !isSaved(selected.id) &&
    data.restaurants.some(
      (item) => item.id === restaurantId && item.visibility === 'visible',
    ),
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
          aria-label="컬렉션 저장"
        >
          <Dialog.Header className="shrink-0">
            <Dialog.Title>컬렉션 저장</Dialog.Title>
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
              aria-label="저장 대상 컬렉션"
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
              {selectCollections(data.collections).map((collection) => {
                const saved = isSaved(collection.id)
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
                        {selectRestaurants(collection, data.restaurants).length}
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
          <Dialog.Footer className="shrink-0">
            <Button size="md" variant="neutral" onClick={onClose}>
              취소
            </Button>
            <Button
              size="md"
              disabled={!canSave}
              onClick={() => {
                if (!canSave || !selectedId) return
                setData((current) =>
                  saveRestaurant(
                    current,
                    selectedId,
                    restaurantId,
                    new Date().toISOString(),
                  ),
                )
                onClose()
              }}
            >
              저장
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
            setData((current) =>
              createCollection(
                current,
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
