import { Button, Dialog } from '@hashi/hds-ui'

import reviewGuideUrl from '@/features/restaurantDetail/assets/review-guide.svg'

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
      <Dialog.Content aria-label="비방문자 리뷰 작성 안내" className="py-6">
        <Dialog.Header>
          <Dialog.Icon>
            <img src={reviewGuideUrl} alt="" width={24} height={24} />
          </Dialog.Icon>
          <div className="flex flex-col items-center gap-2">
            <Dialog.Title className="typo-header-3 text-cool-gray-900 leading-[1.5]">
              예약하고 리뷰를 남겨보세요!
            </Dialog.Title>
            <Dialog.Description className="typo-body-6 text-cool-gray-500 leading-[1.36]">
              하시로 예약 후 식당을 방문하면
              <br /> 리뷰를 작성할 수 있어요.
            </Dialog.Description>
          </div>
        </Dialog.Header>
        <Dialog.Footer>
          <Button
            className="leading-[1.36]"
            onClick={onClose}
            size="md"
            width="full"
          >
            확인
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  )
}
