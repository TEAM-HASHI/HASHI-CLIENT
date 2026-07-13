import { OrderCancelIcon } from '@hashi/hds-icons'
import { Dialog } from '@hashi/hds-ui'

interface ReviewDeleteConfirmDialogProps {
  isPending?: boolean
  onDelete: () => void
}

const secondaryActionClassName =
  'typo-body-6 flex h-9 items-center justify-center rounded-[5px] bg-secondary-200 text-black'

const primaryActionClassName =
  'typo-body-6 flex h-9 items-center justify-center rounded-[5px] bg-cool-gray-800 text-white'

export const ReviewDeleteConfirmDialog = ({
  isPending = false,
  onDelete,
}: ReviewDeleteConfirmDialogProps) => {
  return (
    <Dialog.Content className="py-[23px]">
      <Dialog.Header>
        <Dialog.Icon>
          <OrderCancelIcon className="size-6" />
        </Dialog.Icon>
        <div className="flex flex-col items-center gap-2">
          <Dialog.Title>정말 삭제하시겠습니까?</Dialog.Title>
          <Dialog.Description>
            삭제한 리뷰는 다시 되돌릴 수 없어요.
          </Dialog.Description>
        </div>
      </Dialog.Header>
      <Dialog.Footer>
        <Dialog.Close className={secondaryActionClassName}>
          취소하기
        </Dialog.Close>
        <button
          className={primaryActionClassName}
          disabled={isPending}
          onClick={onDelete}
          type="button"
        >
          {isPending ? '삭제 중' : '삭제하기'}
        </button>
      </Dialog.Footer>
    </Dialog.Content>
  )
}
