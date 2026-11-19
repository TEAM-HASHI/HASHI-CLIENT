import { Button, Dialog } from '@hashi/hds-ui'
import type { ReactNode } from 'react'

import warningIconUrl from '@/features/restaurantDetail/assets/review-moderation-warning.svg'

interface ReviewModerationDialogProps {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel: string
  pending: boolean
  onClose: () => void
  onConfirm: () => void
}

export const ReviewModerationDialog = ({
  open,
  title,
  description,
  confirmLabel,
  pending,
  onClose,
  onConfirm,
}: ReviewModerationDialogProps) => (
  <Dialog.Root
    open={open}
    onOpenChange={(nextOpen) => {
      if (!nextOpen && !pending) onClose()
    }}
  >
    <Dialog.Content className="min-h-[220px] justify-center rounded-[20px]">
      <Dialog.Header>
        <Dialog.Icon>
          <img alt="" height={24} src={warningIconUrl} width={24} />
        </Dialog.Icon>
        <div className="flex flex-col items-center gap-2">
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description className="typo-body-6">
            {description}
          </Dialog.Description>
        </div>
      </Dialog.Header>
      <Dialog.Footer className="grid grid-cols-2">
        <Dialog.Close
          className="typo-body-6 bg-secondary-200 h-9 rounded-[5px] text-black"
          isDisabled={pending}
        >
          돌아가기
        </Dialog.Close>
        <Button
          className="typo-body-6 bg-cool-gray-800 h-9"
          loading={pending}
          onClick={onConfirm}
          size="md"
          width="full"
        >
          {confirmLabel}
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
)
