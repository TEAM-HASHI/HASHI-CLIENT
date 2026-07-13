import { CheckIcon } from '@hashi/hds-icons'
import { Button, Dialog } from '@hashi/hds-ui'

import { formatWon } from '@/pages/reservationRequest/utils/formatWon'

interface ReservationConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isConfirming: boolean
  guestName: string
  guestText: string
  restaurantAddress: string
  visitDateTime: string
  finalPaymentAmount: number
}

const actionButtonClassName =
  'typo-sub-header-2 flex h-[46px] items-center justify-center rounded-[5px] border-0 px-4'

const ReservationConfirmRow = ({
  label,
  value,
  multiline = false,
}: {
  label: string
  value: string
  multiline?: boolean
}) => {
  return (
    <div className="flex items-start justify-between gap-5">
      <span className="typo-sub-header-3 text-cool-gray-900 shrink-0">
        {label}
      </span>
      <span
        className={
          multiline
            ? 'typo-body-6 text-cool-gray-900 max-w-[150px] text-right leading-[1.36] break-keep'
            : 'typo-body-6 text-cool-gray-900 text-right leading-[1.36] whitespace-nowrap'
        }
      >
        {value}
      </span>
    </div>
  )
}

export const ReservationConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isConfirming,
  guestName,
  guestText,
  restaurantAddress,
  visitDateTime,
  finalPaymentAmount,
}: ReservationConfirmDialogProps) => {
  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open} type="alertdialog">
      <Dialog.Content className="w-[319px] p-0">
        <Dialog.Header className="bg-cool-gray-50 w-full gap-2 px-[18px] pt-[25px] pb-[21px]">
          <Dialog.Icon className="size-[27px] rounded-full bg-black text-white">
            <CheckIcon className="size-[26px]" />
          </Dialog.Icon>
          <div className="flex flex-col items-center gap-1">
            <Dialog.Title className="typo-sub-header-1 text-black">
              예약을 진행할까요?
            </Dialog.Title>
            <Dialog.Description className="typo-caption-2 leading-[1.5]">
              예약 확정 시 계좌이체로 결제를 진행합니다.
            </Dialog.Description>
          </div>
        </Dialog.Header>

        <Dialog.Body className="px-6 pt-[37px]">
          <div className="flex flex-col gap-[25px]">
            <ReservationConfirmRow label="예약자" value={guestName} />
            <ReservationConfirmRow label="인원" value={guestText} />
            <ReservationConfirmRow
              label="식당 주소"
              multiline
              value={restaurantAddress}
            />
            <ReservationConfirmRow
              label="식당 방문 일정"
              value={visitDateTime}
            />
          </div>
        </Dialog.Body>

        <div className="bg-cool-gray-50 mt-[42px] h-2 w-full" />

        <Dialog.Body className="px-6 pt-[19px]">
          <div className="flex items-center justify-between">
            <span className="typo-body-3 text-cool-gray-500">
              최종 결제 금액
            </span>
            <strong className="typo-sub-header-2 text-cool-gray-900">
              {formatWon(finalPaymentAmount)}
            </strong>
          </div>
        </Dialog.Body>

        <Dialog.Footer className="mt-[22px] gap-3 px-4 pb-[17px]">
          <Dialog.Close
            className={`${actionButtonClassName} bg-secondary-200 text-black`}
          >
            취소
          </Dialog.Close>
          <Button
            className="typo-sub-header-2 h-[46px]"
            disabled={isConfirming}
            onClick={onConfirm}
            size="lg"
            width="full"
          >
            예약
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  )
}
