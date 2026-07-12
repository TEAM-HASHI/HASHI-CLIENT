import { PencilIcon } from '@hashi/hds-icons'
import { Button, Dialog } from '@hashi/hds-ui'

interface ReviewUnavailableModalProps {
  open: boolean
  onClose: () => void
}

export const ReviewUnavailableModal = ({
  open,
  onClose,
}: ReviewUnavailableModalProps) => {
  return (
    <Dialog.Root
      onOpenChange={(nextOpen) => !nextOpen && onClose()}
      open={open}
    >
      <Dialog.Content aria-label="비방문자 리뷰 작성 안내">
        <Dialog.Header>
          <Dialog.Icon>
            <PencilIcon className="size-6" />
          </Dialog.Icon>
          <Dialog.Title>실제 방문자만 작성할 수 있어요</Dialog.Title>
          <Dialog.Description>
            리뷰는 하시를 통해 예약하고
            <br /> 방문하신 분만 남길 수 있어요!
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Button onClick={onClose} size="lg" width="full">
            확인
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  )
}
