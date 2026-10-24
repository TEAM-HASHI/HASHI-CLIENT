import { CheckIcon, PlusIcon, SaveIcon } from '@hashi/hds-icons'
import { Button, Dialog } from '@hashi/hds-ui'
import { useCallback, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/app/router/path'
import { CollectionCover } from '@/features/collection/components/CollectionCover'
import {
  getCollectionFormState,
  getCollectionSaveState,
  getCollectionSaveRestaurantId,
} from '@/features/collection/utils/collectionNavigation'
import type { CollectionSummaryReadModelTypes } from '@/features/collection/types/collectionReadModels'
import { cn } from '@/shared/utils'
import { getErrorPresentation } from '@/shared/api/errorPresentation'

type CollectionTargetDialogViewProps = {
  createState?: unknown
  collections: readonly Pick<
    CollectionSummaryReadModelTypes,
    'id' | 'name' | 'color' | 'coverImages' | 'savedCount'
  >[]
  selectedId: string | null
  onSelect: (id: string) => void
  onClose: () => void
  title: string
  excludeId?: string
  isDisabled?: (id: string) => boolean
  isChecked?: (id: string) => boolean
  onConfirm: (id: string) => void | Promise<void>
  confirmLabel: (id: string | null) => string
  feedback?: (id: string) => string
  confirmDisabled?: boolean
  onListMount?: (node: HTMLDivElement | null) => void
  listStatus?: ReactNode
  notice?: ReactNode
}

export const CollectionTargetDialogView = ({
  collections,
  selectedId,
  onSelect,
  onClose,
  title,
  excludeId,
  isDisabled = () => false,
  isChecked,
  onConfirm,
  confirmLabel,
  feedback,
  createState,
  onListMount,
  listStatus,
  notice,
  confirmDisabled = false,
}: CollectionTargetDialogViewProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const submitting = useRef(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const close = () => {
    if (!submitting.current) onClose()
  }
  const setListRef = useCallback(
    (node: HTMLDivElement | null) => {
      onListMount?.(
        node?.parentElement instanceof HTMLDivElement
          ? node.parentElement
          : null,
      )
    },
    [onListMount],
  )
  const selected = collections.find((item) => item.id === selectedId)
  const canSave = Boolean(
    selected &&
    selected.id !== excludeId &&
    !isDisabled(selected.id) &&
    !confirmDisabled,
  )

  return (
    <>
      <Dialog.Root
        open
        onOpenChange={(open) => {
          if (!open) close()
        }}
      >
        <Dialog.Content
          className="max-h-[calc(100dvh-48px)] overflow-hidden rounded-[20px] p-6"
          aria-label={title}
        >
          <Dialog.Header className="shrink-0">
            <Dialog.Title>{title}</Dialog.Title>
          </Dialog.Header>
          <button
            disabled={pending}
            type="button"
            onClick={() => {
              const restored = createState ?? location.state
              const returnState = getCollectionSaveState(
                restored,
                getCollectionSaveRestaurantId(restored),
                selectedId,
              )
              navigate(
                { pathname: location.pathname, search: location.search },
                { replace: true, state: returnState },
              )
              navigate(ROUTES.collectionNew, {
                state: getCollectionFormState({
                  ...location,
                  state: returnState,
                }),
              })
            }}
            className="border-warm-gray-50 mt-3 flex min-h-20 w-full shrink-0 items-center gap-3 border-b text-left"
          >
            <span className="bg-primary-100 flex size-12 shrink-0 items-center justify-center rounded-[5px]">
              <PlusIcon className="text-primary-200 size-8" />
            </span>
            <span className="typo-body-3 text-primary-200">
              새 컬렉션 만들기
            </span>
          </button>
          <Dialog.Body className="max-h-65 min-h-0 w-[calc(100%+16px)] self-start overflow-y-auto overscroll-contain pr-4">
            <div
              ref={setListRef}
              role={isChecked ? 'group' : 'radiogroup'}
              aria-label={`${title} 대상`}
              onKeyDown={(event) => {
                if (isChecked) return
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
              {collections
                .filter((c) => c.id !== excludeId)
                .map((collection) => {
                  const disabled = isDisabled(collection.id)
                  const saved = !isChecked && disabled
                  const selected = isChecked
                    ? isChecked(collection.id)
                    : selectedId === collection.id
                  return (
                    <button
                      key={collection.id}
                      type="button"
                      role={isChecked ? 'checkbox' : 'radio'}
                      aria-checked={selected}
                      disabled={disabled || pending}
                      aria-label={`${collection.name}${saved ? ' (저장됨)' : ''}`}
                      onClick={() => {
                        setError(null)
                        onSelect(collection.id)
                      }}
                      className="border-warm-gray-50 flex min-h-20 w-full items-center gap-3 border-b py-3 text-left focus-visible:outline-2 disabled:cursor-default"
                    >
                      <CollectionCover collection={collection} compact />
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="typo-sub-header-2 text-primary-200 [overflow-wrap:anywhere] break-words">
                          {collection.name}
                        </span>
                        {collection.savedCount !== undefined && (
                          <span className="typo-body-7 text-cool-gray-600 flex items-center">
                            <SaveIcon className="text-warm-gray-100 size-4" />
                            {collection.savedCount}
                          </span>
                        )}
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
            {listStatus}
          </Dialog.Body>
          {selectedId && feedback?.(selectedId) && (
            <p
              role="status"
              className="typo-body-6 text-primary-200 mt-3 w-full"
            >
              {feedback(selectedId)}
            </p>
          )}
          {notice}
          {error !== null && (
            <p role="alert" className="typo-body-7 text-primary-400 mt-3">
              {getErrorPresentation(error).message}
            </p>
          )}
          <Dialog.Footer className="shrink-0">
            <Button
              size="md"
              variant="neutral"
              onClick={close}
              disabled={pending}
            >
              취소
            </Button>
            <Button
              size="md"
              disabled={!canSave || pending}
              onClick={async () => {
                if (!canSave || !selectedId || submitting.current) return
                submitting.current = true
                setPending(true)
                setError(null)
                try {
                  await onConfirm(selectedId)
                } catch (cause) {
                  setError(cause)
                } finally {
                  submitting.current = false
                  setPending(false)
                }
              }}
            >
              {confirmLabel(selectedId)}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </>
  )
}
