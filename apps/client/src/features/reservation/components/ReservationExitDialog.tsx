import { OrderCancelIcon } from '@hashi/hds-icons'
import { Button, Dialog } from '@hashi/hds-ui'

interface ReservationExitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExit: () => void
}

export const ReservationExitDialog = ({
  open,
  onOpenChange,
  onExit,
}: ReservationExitDialogProps) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange} type="alertdialog">
    <Dialog.Content className="rounded-[20px]">
      <Dialog.Header className="gap-2">
        <Dialog.Icon>
          <OrderCancelIcon className="size-6" />
        </Dialog.Icon>
        <Dialog.Title className="leading-[30px]">
          예약을 그만두시겠어요?
        </Dialog.Title>
        <Dialog.Description className="typo-body-6 leading-[19px]">
          지금 나가면 입력한
          <br />
          예약 정보가 사라져요.
        </Dialog.Description>
      </Dialog.Header>
      <Dialog.Footer>
        <Dialog.Close className="typo-body-6 bg-secondary-200 hover:bg-warm-gray-50 h-9 rounded-[5px] px-2 whitespace-nowrap text-black">
          계속 예약하기
        </Dialog.Close>
        <Button onClick={onExit} width="full" size="md" className="px-2">
          그만두기
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
)
