import { SmileIcon } from '@hashi/hds-icons'
import { Dialog } from '@hashi/hds-ui'

type ComingSoonDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ComingSoonDialog = ({
  open,
  onOpenChange,
}: ComingSoonDialogProps) => {
  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Content className="rounded-[20px]">
        <Dialog.Header>
          <Dialog.Icon className="size-6">
            <SmileIcon className="size-6" />
          </Dialog.Icon>
          <div className="flex flex-col items-center gap-2">
            <Dialog.Title>서비스를 준비하고 있어요.</Dialog.Title>
            <Dialog.Description className="typo-body-4 text-primary-200">
              더 편한 Hashi 이용을 위해
              <br />
              현재 기능을 준비하고 있어요.
            </Dialog.Description>
          </div>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close className="bg-cool-gray-800 flex h-9 items-center justify-center rounded-[5px] border-0 px-4 font-sans text-[14px] leading-[1.36] font-medium text-white">
            확인
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  )
}
