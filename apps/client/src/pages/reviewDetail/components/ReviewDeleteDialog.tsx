import { CloseSmallIcon } from '@hashi/hds-icons'
import { Dialog } from '@hashi/hds-ui'

interface ReviewDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirmDeleteClick: () => void
}

const dialogActionClassName =
  'typo-body-6 flex h-8 items-center justify-center rounded-[5px] px-4'

export const ReviewDeleteDialog = ({
  open,
  onOpenChange,
  onConfirmDeleteClick,
}: ReviewDeleteDialogProps) => {
  return (
    <Dialog.Root open={open} type="alertdialog" onOpenChange={onOpenChange}>
      <Dialog.Content
        aria-label="리뷰 삭제 확인"
        className="w-68 max-w-[calc(100vw-48px)] rounded-[10px] px-5 pt-4 pb-5"
      >
        <Dialog.Header className="gap-4">
          <Dialog.Close
            aria-label="삭제 확인 모달 닫기"
            className="text-primary-400 flex size-5 items-center justify-center"
          >
            <CloseSmallIcon className="size-4.5" />
          </Dialog.Close>
          <div className="flex flex-col items-center gap-2">
            <Dialog.Title>정말 삭제하시겠습니까?</Dialog.Title>
            <Dialog.Description>
              삭제한 리뷰는 다시 되돌릴 수 없어요.
            </Dialog.Description>
          </div>
        </Dialog.Header>
        <Dialog.Footer className="mt-5 gap-2">
          <Dialog.Close
            className={`${dialogActionClassName} bg-secondary-200 text-black`}
          >
            취소하기
          </Dialog.Close>
          <button
            className={`${dialogActionClassName} bg-cool-gray-800 text-white`}
            onClick={onConfirmDeleteClick}
            type="button"
          >
            삭제하기
          </button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  )
}
