import { BackIcon, CheckIcon, OrderCancelIcon } from '@hashi/hds-icons'
import {
  Button,
  Chip,
  Dialog,
  Header,
  IconButton,
  InputField,
  Textarea,
} from '@hashi/hds-ui'
import { useId, useLayoutEffect, useRef, useState } from 'react'
import { useBlocker } from 'react-router-dom'
import { CollectionCover } from '@/pages/saved/components/CollectionCover'
import { COLLECTION_COVER_COLORS } from '@/pages/saved/data/collectionPalette'
import type { CollectionColor, SavedCollection } from '@/pages/saved/types'
import {
  COLLECTION_NAME_LIMIT,
  COLLECTION_DESCRIPTION_LIMIT,
  isDuplicateCollectionName,
  normalizeCollectionDraft,
  normalizeCollectionDescription,
  validateCollection,
} from '@/pages/saved/utils/collectionMutations'
import type { CollectionDraft } from '@/pages/saved/utils/collectionMutations'
import { BottomActionBar } from '@/shared/components/bottomActionBar/BottomActionBar'
import { getCollectionHistoryIndex } from '@/pages/saved/utils/collectionNavigation'
import { ApiError } from '@/shared/api/apiError'
import { getErrorPresentation } from '@/shared/api/errorPresentation'
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
const DESCRIPTION_MIN_HEIGHT = 51
const DESCRIPTION_MAX_CLIENT_HEIGHT = 127
const DESCRIPTION_BORDER_HEIGHT = 2
const DESCRIPTION_MAX_HEIGHT =
  DESCRIPTION_MAX_CLIENT_HEIGHT + DESCRIPTION_BORDER_HEIGHT

export const CollectionForm = ({
  collection,
  collections,
  onSubmit,
  onSubmitSuccess,
  onClose,
  onDiscard = onClose,
}: {
  collection?: Pick<
    SavedCollection,
    'id' | 'name' | 'description' | 'color' | 'isPublic' | 'coverImages'
  >
  collections: readonly Pick<SavedCollection, 'id' | 'name'>[]
  onSubmit: (draft: CollectionDraft) => void | Promise<void>
  onSubmitSuccess?: () => void
  onClose: () => void
  onDiscard?: () => void
}) => {
  const id = useId()
  const allowNavigation = useRef(false)
  const submitting = useRef(false)
  const historyIndex = useRef(getCollectionHistoryIndex())
  const composing = useRef(false)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const [isComposing, setIsComposing] = useState(false)
  const initial: CollectionDraft = collection
    ? {
        ...collection,
        description: normalizeCollectionDescription(collection.description),
      }
    : EMPTY_DRAFT
  const [draft, setDraft] = useState<CollectionDraft>(initial)
  const [overLimit, setOverLimit] = useState({
    name: false,
    description: false,
  })
  const [discarding, setDiscarding] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<unknown>(null)
  const hasServerDuplicateName =
    submitError instanceof ApiError && submitError.code === 'USER-007'
  const normalizedDraft = normalizeCollectionDraft(draft)
  const normalizedInitial = normalizeCollectionDraft(initial)
  const changed = (['name', 'description', 'color', 'isPublic'] as const).some(
    (key) => normalizedDraft[key] !== normalizedInitial[key],
  )
  const error = validateCollection(draft, collections, collection?.id)
  const hasDuplicateName =
    !isSubmitted &&
    (hasServerDuplicateName ||
      isDuplicateCollectionName(draft, collections, collection?.id))
  const canSubmit =
    !isSubmitted &&
    !isComposing &&
    !error &&
    !hasDuplicateName &&
    (!collection || changed)
  const needsConfirmation = Boolean(collection && changed)
  const blocker = useBlocker(({ historyAction }) => {
    const nextIndex = getCollectionHistoryIndex()
    const isBack =
      historyIndex.current === undefined ||
      nextIndex === undefined ||
      nextIndex < historyIndex.current
    return (
      submitting.current ||
      (!allowNavigation.current &&
        needsConfirmation &&
        historyAction === 'POP' &&
        isBack)
    )
  })
  useLayoutEffect(() => {
    const textarea = descriptionRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    const contentHeight = textarea.scrollHeight + DESCRIPTION_BORDER_HEIGHT
    textarea.style.height = `${Math.min(
      Math.max(contentHeight, DESCRIPTION_MIN_HEIGHT),
      DESCRIPTION_MAX_HEIGHT,
    )}px`
    textarea.style.overflowY =
      textarea.scrollHeight > DESCRIPTION_MAX_CLIENT_HEIGHT ? 'auto' : 'hidden'
  }, [draft.description])
  const close = () => {
    if (submitting.current) return
    if (needsConfirmation) setDiscarding(true)
    else onClose()
  }
  const changeText = (
    key: 'name' | 'description',
    limit: number,
    next: string,
  ) => {
    if (key === 'name') setSubmitError(null)
    if (!composing.current)
      setOverLimit((current) => ({ ...current, [key]: next.length > limit }))
    setDraft((current) => ({
      ...current,
      [key]: next,
    }))
  }
  const startComposition = () => {
    composing.current = true
    setIsComposing(true)
  }
  const endComposition = (
    key: 'name' | 'description',
    limit: number,
    next: string,
  ) => {
    if (key === 'name') setSubmitError(null)
    composing.current = false
    setIsComposing(false)
    setOverLimit((current) => ({ ...current, [key]: next.length > limit }))
    setDraft((current) => ({ ...current, [key]: next }))
  }

  return (
    <>
      <section
        aria-label={collection ? '컬렉션 수정' : '새 컬렉션 만들기'}
        className="app-mobile-bottom-action-content min-h-dvh bg-white pt-[calc(75px+var(--safe-area-top,0px))]"
      >
        <div className="app-mobile-fixed-top z-fixed bg-white pt-[var(--safe-area-top,0px)]">
          <Header
            title={collection ? '컬렉션 수정' : '새 컬렉션 만들기'}
            leftAction={
              <IconButton
                size="xs"
                aria-label="뒤로가기"
                onClick={close}
                disabled={isSubmitted}
              >
                <BackIcon className="size-6" />
              </IconButton>
            }
          />
        </div>
        <form
          id={`${id}-form`}
          className="w-full px-6"
          onSubmit={async (event) => {
            event.preventDefault()
            if (!canSubmit || submitting.current) return
            submitting.current = true
            setIsSubmitted(true)
            setSubmitError(null)
            try {
              const result = onSubmit(draft)
              if (result) await result
            } catch (cause) {
              submitting.current = false
              setIsSubmitted(false)
              setSubmitError(cause)
              return
            }
            submitting.current = false
            allowNavigation.current = true
            onSubmitSuccess?.()
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
              disabled={isSubmitted}
              className="h-[53px] px-5"
              id={`${id}-name`}
              aria-label="컬렉션명"
              placeholder="새 컬렉션명을 입력해주세요."
              value={draft.name}
              onCompositionStart={startComposition}
              onCompositionEnd={(event) =>
                endComposition(
                  'name',
                  COLLECTION_NAME_LIMIT,
                  event.currentTarget.value,
                )
              }
              onChange={(event) =>
                changeText(
                  'name',
                  COLLECTION_NAME_LIMIT,
                  event.currentTarget.value,
                )
              }
              aria-invalid={overLimit.name || hasDuplicateName}
              aria-describedby={`${id}-name-status`}
            />
            <div
              id={`${id}-name-status`}
              className="flex flex-wrap justify-between gap-1"
            >
              <span className="typo-body-7 text-primary-400" role="status">
                {overLimit.name
                  ? LIMIT_MESSAGE
                  : hasDuplicateName
                    ? '중복된 컬렉션명입니다.'
                    : ''}
              </span>
              <span className="typo-body-6 text-warm-gray-300 ml-auto leading-[1.36]">
                <span
                  className={
                    overLimit.name ? 'text-primary-400' : 'text-primary-200'
                  }
                >
                  {draft.name.length}
                </span>{' '}
                /{COLLECTION_NAME_LIMIT}
              </span>
            </div>
          </div>
          <fieldset className="w-full pb-7" disabled={isSubmitted}>
            <legend className="typo-sub-header-1 text-primary-200">
              색상 선택
            </legend>
            <div className="mt-4 flex justify-between px-2.5">
              {(Object.keys(COLOR_LABELS) as CollectionColor[]).map((color) => (
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
                      className="pointer-events-none size-6.5 text-white"
                    />
                  )}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-col gap-3">
            <label
              htmlFor={`${id}-description`}
              className="typo-sub-header-1 text-primary-200"
            >
              설명
            </label>
            <Textarea
              disabled={isSubmitted}
              className="gap-3"
              textareaClassName="min-h-[51px] max-h-[129px] px-5 py-4"
              id={`${id}-description`}
              ref={descriptionRef}
              aria-label="설명"
              placeholder="자유롭게 작성해보세요."
              value={draft.description}
              maxLength={COLLECTION_DESCRIPTION_LIMIT}
              maxLengthBehavior="allow"
              showCounter
              errorMessage={LIMIT_MESSAGE}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  !event.nativeEvent.isComposing &&
                  !composing.current
                )
                  event.preventDefault()
              }}
              onCompositionStart={startComposition}
              onCompositionEnd={(event) =>
                endComposition(
                  'description',
                  COLLECTION_DESCRIPTION_LIMIT,
                  normalizeCollectionDescription(event.currentTarget.value),
                )
              }
              onChange={(event) =>
                changeText(
                  'description',
                  COLLECTION_DESCRIPTION_LIMIT,
                  normalizeCollectionDescription(event.currentTarget.value),
                )
              }
              aria-invalid={overLimit.description}
            />
          </div>
          <div
            className="flex flex-wrap items-center justify-between gap-3 py-5"
            role="group"
            aria-label="공개 범위"
          >
            <span className="typo-sub-header-1 text-primary-200">
              공개 범위
            </span>
            <fieldset className="flex gap-3" disabled={isSubmitted}>
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
            </fieldset>
          </div>
          {submitError !== null && !hasServerDuplicateName && (
            <p role="alert" className="typo-body-7 text-primary-400 pb-5">
              {getErrorPresentation(submitError).message}
            </p>
          )}
        </form>
        <BottomActionBar
          aria-label={collection ? '컬렉션 수정 제출' : '컬렉션 생성 제출'}
          endAction={
            <Button
              form={`${id}-form`}
              type="submit"
              width="full"
              disabled={!canSubmit}
            >
              {collection ? '저장하기' : '만들기'}
            </Button>
          }
        />
      </section>
      <Dialog.Root
        type="alertdialog"
        open={
          !isSubmitted &&
          (discarding || (blocker.state === 'blocked' && needsConfirmation))
        }
        onOpenChange={(open) => {
          setDiscarding(open)
          if (!open && blocker.state === 'blocked') blocker.reset()
        }}
      >
        <Dialog.Content className="min-h-55 justify-center rounded-[20px] px-6.75 py-6.5">
          <Dialog.Header className="gap-3">
            <Dialog.Icon>
              <OrderCancelIcon className="size-6" />
            </Dialog.Icon>
            <div className="flex w-full flex-col items-center gap-2">
              <Dialog.Title>변경사항이 저장되지 않았어요.</Dialog.Title>
              <Dialog.Description className="typo-body-6 flex min-h-9.5 items-center justify-center leading-[1.36]">
                저장하지 않고 나가면 변경사항이 사라져요.
              </Dialog.Description>
            </div>
          </Dialog.Header>
          <Dialog.Footer>
            <Button
              variant="neutral"
              size="md"
              onClick={() => {
                if (blocker.state === 'blocked') blocker.reset()
                allowNavigation.current = true
                onDiscard()
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
