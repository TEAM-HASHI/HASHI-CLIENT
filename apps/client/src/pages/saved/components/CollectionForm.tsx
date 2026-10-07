import { BackIcon, CheckIcon } from '@hashi/hds-icons'
import {
  Button,
  Chip,
  Dialog,
  Header,
  IconButton,
  InputField,
} from '@hashi/hds-ui'
import { useEffect, useId, useRef, useState } from 'react'
import { useBlocker } from 'react-router-dom'
import type { ChangeEvent } from 'react'
import { CollectionCover } from '@/pages/saved/components/CollectionCover'
import { COLLECTION_COVER_COLORS } from '@/pages/saved/data/collectionPalette'
import type { CollectionColor, SavedCollection } from '@/pages/saved/types'
import {
  COLLECTION_NAME_LIMIT,
  COLLECTION_DESCRIPTION_LIMIT,
  normalizeCollectionDraft,
  validateCollection,
} from '@/pages/saved/utils/collectionMutations'
import type { CollectionDraft } from '@/pages/saved/utils/collectionMutations'
import { cn } from '@/shared/utils'

const COLOR_LABELS: Record<CollectionColor, string> = {
  red: '빨강',
  orange: '주황',
  yellow: '노랑',
  green: '초록',
  blue: '파랑',
  purple: '보라',
}
const EMPTY_DRAFT: CollectionDraft = {
  name: '',
  description: '',
  color: null,
  isPublic: true,
}
const LIMIT_MESSAGE = '글자 수 제한을 초과했어요.'

export const CollectionForm = ({
  collection,
  collections,
  onSubmit,
  onClose,
}: {
  collection?: SavedCollection
  collections: readonly SavedCollection[]
  onSubmit: (draft: CollectionDraft) => void
  onClose: () => void
}) => {
  const id = useId()
  const blocker = useBlocker(true)
  const composing = useRef(false)
  const [isComposing, setIsComposing] = useState(false)
  const initial: CollectionDraft = collection ?? EMPTY_DRAFT
  const [draft, setDraft] = useState<CollectionDraft>(initial)
  const [overLimit, setOverLimit] = useState({
    name: false,
    description: false,
  })
  const [discarding, setDiscarding] = useState(false)
  const value = normalizeCollectionDraft(draft, Boolean(collection))
  const changed = (['name', 'description', 'color', 'isPublic'] as const).some(
    (key) => draft[key] !== initial[key],
  )
  const savedChanged = (
    ['name', 'description', 'color', 'isPublic'] as const
  ).some((key) => value[key] !== initial[key])
  const error = validateCollection(draft, collections, collection?.id)
  const canSubmit = !isComposing && !error && (!collection || savedChanged)
  const needsConfirmation = Boolean(collection && changed)
  useEffect(() => {
    if (blocker.state === 'blocked' && !needsConfirmation) {
      blocker.reset()
      onClose()
    }
  }, [blocker, needsConfirmation, onClose])
  const close = () => {
    if (needsConfirmation) setDiscarding(true)
    else onClose()
  }
  const changeText =
    (key: 'name' | 'description', limit: number) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value
      if (!composing.current)
        setOverLimit((current) => ({ ...current, [key]: next.length > limit }))
      setDraft((current) => ({
        ...current,
        [key]: composing.current ? next : next.slice(0, limit),
      }))
    }
  const compositionProps = (key: 'name' | 'description', limit: number) => ({
    onCompositionStart: () => {
      composing.current = true
      setIsComposing(true)
    },
    onCompositionEnd: (event: React.CompositionEvent<HTMLInputElement>) => {
      composing.current = false
      setIsComposing(false)
      const next = event.currentTarget.value
      setOverLimit((current) => ({ ...current, [key]: next.length > limit }))
      setDraft((current) => ({ ...current, [key]: next.slice(0, limit) }))
    },
  })

  return (
    <>
      <Dialog.Root
        open
        onOpenChange={(open) => {
          if (!open) close()
        }}
      >
        <Dialog.Content
          aria-label={collection ? '컬렉션 수정' : '새 컬렉션 만들기'}
          className="h-dvh max-h-dvh w-screen max-w-[var(--app-mobile-max-width,100vw)] rounded-none p-0 pt-[var(--safe-area-top,0px)]"
        >
          <Header
            className="shrink-0"
            title={collection ? '컬렉션 수정' : '새 컬렉션 만들기'}
            leftAction={
              <IconButton size="xs" aria-label="뒤로가기" onClick={close}>
                <BackIcon className="size-6" />
              </IconButton>
            }
          />
          <form
            id={`${id}-form`}
            className="min-h-0 w-full flex-1 overflow-y-auto overscroll-contain px-6"
            onSubmit={(event) => {
              event.preventDefault()
              if (canSubmit) onSubmit(value)
            }}
          >
            <div className="my-8.5 flex justify-center">
              <CollectionCover
                collection={{
                  color: draft.color,
                  coverImages: collection?.coverImages ?? [null, null, null],
                }}
              />
            </div>
            <div className="flex flex-col gap-3">
              <label
                htmlFor={`${id}-name`}
                className="typo-sub-header-1 text-primary-200"
              >
                컬렉션명
              </label>
              <InputField
                id={`${id}-name`}
                aria-label="컬렉션명"
                placeholder="새 컬렉션 명을 입력해주세요"
                value={draft.name}
                {...compositionProps('name', COLLECTION_NAME_LIMIT)}
                onChange={changeText('name', COLLECTION_NAME_LIMIT)}
                aria-invalid={overLimit.name || error === 'duplicate'}
                aria-describedby={`${id}-name-status`}
              />
              <div
                id={`${id}-name-status`}
                className="typo-body-6 flex flex-wrap justify-between gap-1"
              >
                <span className="text-primary-400" role="status">
                  {overLimit.name
                    ? LIMIT_MESSAGE
                    : error === 'duplicate'
                      ? '이미 사용 중인 컬렉션명이에요.'
                      : ''}
                </span>
                <span className="text-warm-gray-300 ml-auto">
                  <span className="text-primary-200">{draft.name.length}</span>{' '}
                  /{COLLECTION_NAME_LIMIT}
                </span>
              </div>
            </div>
            <fieldset className="mb-3 w-full pb-7">
              <legend className="typo-sub-header-1 text-primary-200">
                색상 선택
              </legend>
              <div className="mt-4 flex justify-between px-2.5">
                {(Object.keys(COLOR_LABELS) as CollectionColor[]).map(
                  (color) => (
                    <label
                      key={color}
                      className="relative flex size-8 cursor-pointer items-center justify-center rounded-full"
                      style={{
                        background: COLLECTION_COVER_COLORS[color].background,
                      }}
                    >
                      <input
                        className="peer absolute inset-0 size-full cursor-pointer opacity-0"
                        type="radio"
                        name={`${id}-color`}
                        aria-label={COLOR_LABELS[color]}
                        checked={draft.color === color}
                        onChange={() =>
                          setDraft((current) => ({ ...current, color }))
                        }
                      />
                      <span className="pointer-events-none absolute inset-0 rounded-full peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2" />
                      {draft.color === color && (
                        <CheckIcon
                          aria-hidden="true"
                          className="pointer-events-none size-5 text-white"
                        />
                      )}
                    </label>
                  ),
                )}
              </div>
            </fieldset>
            <div className="flex flex-col gap-3">
              <label
                htmlFor={`${id}-description`}
                className="typo-sub-header-1 text-primary-200"
              >
                설명
              </label>
              <InputField
                id={`${id}-description`}
                aria-label="설명"
                placeholder="지유롭게 작성해보세요"
                value={draft.description}
                {...compositionProps(
                  'description',
                  COLLECTION_DESCRIPTION_LIMIT,
                )}
                onChange={changeText(
                  'description',
                  COLLECTION_DESCRIPTION_LIMIT,
                )}
                aria-invalid={overLimit.description}
                aria-describedby={`${id}-description-status`}
              />
              <div
                id={`${id}-description-status`}
                className="typo-body-6 flex flex-wrap justify-between gap-1"
              >
                <span role="status" className="text-primary-400">
                  {overLimit.description ? LIMIT_MESSAGE : ''}
                </span>
                <span className="text-warm-gray-300 ml-auto">
                  <span className="text-primary-200">
                    {draft.description.length}
                  </span>{' '}
                  /{COLLECTION_DESCRIPTION_LIMIT}
                </span>
              </div>
            </div>
            <div
              className="flex flex-wrap items-center justify-between gap-3 py-5"
              role="group"
              aria-label="공개 범위"
            >
              <span className="typo-sub-header-1 text-primary-200">
                공개 범위
              </span>
              <div className="flex gap-3">
                {[true, false].map((isPublic) => (
                  <Chip
                    key={String(isPublic)}
                    selected={draft.isPublic === isPublic}
                    onSelectedChange={() =>
                      setDraft((current) => ({ ...current, isPublic }))
                    }
                    className={cn(
                      '[&>span]:typo-body-4 h-7 py-1',
                      draft.isPublic === isPublic
                        ? 'bg-cool-gray-900'
                        : 'border-warm-gray-300 text-warm-gray-300 border bg-white',
                    )}
                  >
                    {isPublic ? '공개' : '비공개'}
                  </Chip>
                ))}
              </div>
            </div>
          </form>
          <div className="w-full shrink-0 px-5 pt-2.5 pb-[max(30px,var(--safe-area-bottom,0px))]">
            <Button
              form={`${id}-form`}
              type="submit"
              width="full"
              disabled={!canSubmit}
            >
              {collection ? '저장하기' : '만들기'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Root>
      <Dialog.Root
        type="alertdialog"
        open={discarding || (blocker.state === 'blocked' && needsConfirmation)}
        onOpenChange={(open) => {
          setDiscarding(open)
          if (!open && blocker.state === 'blocked') blocker.reset()
        }}
      >
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>변경 사항을 저장하지 않고 나갈까요?</Dialog.Title>
            <Dialog.Description>
              저장하지 않은 변경 사항은 사라져요.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Button
              variant="neutral"
              size="md"
              onClick={() => {
                if (blocker.state === 'blocked') blocker.reset()
                onClose()
              }}
            >
              뒤로가기
            </Button>
            <Button
              size="md"
              onClick={() => {
                setDiscarding(false)
                if (blocker.state === 'blocked') blocker.reset()
              }}
            >
              계속하기
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </>
  )
}
