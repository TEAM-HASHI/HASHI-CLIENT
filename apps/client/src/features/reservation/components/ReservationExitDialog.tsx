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
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>예약 작성을 그만할까요?</Dialog.Title>
        <Dialog.Description>
          작성 중인 예약 정보가 사라집니다.
        </Dialog.Description>
      </Dialog.Header>
      <Dialog.Footer>
        <Dialog.Close>계속 작성</Dialog.Close>
        <Button onClick={onExit} width="full">
          나가기
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
)
