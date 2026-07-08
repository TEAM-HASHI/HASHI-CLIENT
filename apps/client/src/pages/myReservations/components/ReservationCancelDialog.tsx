import { OrderCancelIcon } from '@hashi/hds-icons'
import { Dialog } from '@hashi/hds-ui'

type ReservationCancelDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirmCancelPress: () => void
}

const primaryActionClassName =
  'flex h-9 items-center justify-center rounded-[5px] border-0 bg-cool-gray-800 px-4 font-sans text-[14px] font-medium leading-[1.36] text-white'

const secondaryActionClassName =
  'flex h-9 items-center justify-center rounded-[5px] border-0 bg-secondary-200 px-4 font-sans text-[14px] font-medium leading-[1.36] text-black'

export const ReservationCancelDialog = ({
  open,
  onOpenChange,
  onConfirmCancelPress,
}: ReservationCancelDialogProps) => {
  return (
    <Dialog.Root open={open} type="alertdialog" onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Icon>
            <OrderCancelIcon className="size-6" />
          </Dialog.Icon>
          <div className="flex flex-col items-center gap-2">
            <Dialog.Title>정말 예약을 취소하시겠습니까?</Dialog.Title>
            <Dialog.Description>
              <span className="block">
                예약을 취소하면 방문 예정 내역에서 삭제되며
              </span>
              <span className="block">동일한 예약은 다시 접수해야 합니다.</span>
            </Dialog.Description>
          </div>
        </Dialog.Header>
        <Dialog.Footer>
          <button
            className={secondaryActionClassName}
            onClick={onConfirmCancelPress}
            type="button"
          >
            취소하기
          </button>
          <Dialog.Close className={primaryActionClassName}>닫기</Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  )
}
