import { OrderCancelIcon } from '@hashi/hds-icons'
import { Button, Dialog } from '@hashi/hds-ui'

interface ReviewDeleteDialogProps {
  isPending?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirmDeleteClick: () => void
}

export const ReviewDeleteDialog = ({
  isPending = false,
  open,
  onOpenChange,
  onConfirmDeleteClick,
}: ReviewDeleteDialogProps) => {
  return (
    <Dialog.Root open={open} type="alertdialog" onOpenChange={onOpenChange}>
      <Dialog.Content aria-label="리뷰 삭제 확인" className="py-[23px]">
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
          <Button
            className="text-black"
            size="sm"
            variant="neutral"
            width="full"
            onClick={() => onOpenChange(false)}
          >
            취소하기
          </Button>
          <Button
            disabled={isPending}
            onClick={onConfirmDeleteClick}
            size="sm"
            variant="primary"
            width="full"
          >
            {isPending ? '삭제 중' : '삭제하기'}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  )
}
