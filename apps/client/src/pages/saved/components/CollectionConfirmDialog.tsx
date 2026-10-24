import { NoteIcon, OrderCancelIcon } from '@hashi/hds-icons'
import { Button, Dialog } from '@hashi/hds-ui'
import { useRef, useState, type ReactNode } from 'react'

import { getErrorPresentation } from '@/shared/api/errorPresentation'
import { cn } from '@/shared/utils'

export const CollectionConfirmDialog = ({
  open,
  sharing = false,
  deletingCollection = false,
  canConfirm = true,
  onClose,
  onConfirm,
  children,
}: {
  open: boolean
  sharing?: boolean
  deletingCollection?: boolean
  canConfirm?: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  children?: ReactNode
}) => {
  const submitting = useRef(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const close = () => {
    if (!submitting.current) onClose()
  }
  return (
    <Dialog.Root
      type="alertdialog"
      open={open}
      onOpenChange={(next) => {
        if (!next) close()
      }}
    >
      <Dialog.Content
        className={cn(
          'max-h-[calc(100dvh-48px)] min-h-55 justify-center overflow-y-auto rounded-[20px] px-6.75',
          sharing ? 'py-6.5' : 'py-6',
        )}
      >
        <Dialog.Header>
          <Dialog.Icon>
            {sharing ? (
              <NoteIcon className="size-6" />
            ) : (
              <OrderCancelIcon className="size-6" />
            )}
          </Dialog.Icon>
          <div className="flex w-full flex-col items-center gap-2">
            <Dialog.Title className="leading-normal">
              {sharing ? (
                <>
                  공개된 컬렉션만 공유할 수 있어요.
                  <br />
                  공개로 변경하시겠어요?
                </>
              ) : (
                '정말 삭제하시겠습니까?'
              )}
            </Dialog.Title>
            {!sharing && (
              <Dialog.Description className="typo-body-6 flex min-h-9.5 items-center justify-center leading-[1.36]">
                {deletingCollection ? (
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
          </div>
        </Dialog.Header>
        {children}
        {error !== null && (
          <p role="alert" className="typo-body-7 text-primary-400">
            {getErrorPresentation(error).message}
          </p>
        )}
        <Dialog.Footer className="max-w-68 self-center">
          <Button
            size="md"
            variant="neutral"
            className="leading-[1.36]"
            onClick={close}
            disabled={pending}
          >
            취소하기
          </Button>
          <Button
            size="md"
            className="leading-[1.36]"
            disabled={!canConfirm || pending}
            onClick={async () => {
              if (!canConfirm || submitting.current) return
              submitting.current = true
              setPending(true)
              setError(null)
              try {
                await onConfirm()
              } catch (cause) {
                setError(cause)
              } finally {
                submitting.current = false
                setPending(false)
              }
            }}
          >
            {sharing ? '공개 후 공유' : '삭제하기'}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  )
}
