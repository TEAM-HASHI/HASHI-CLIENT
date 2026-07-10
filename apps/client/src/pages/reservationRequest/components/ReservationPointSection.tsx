import { HashiPointMarkIcon } from '@hashi/hds-icons'
import { Button } from '@hashi/hds-ui'
import type { ChangeEvent } from 'react'

import { formatWon } from '@/pages/reservationRequest/utils/formatWon'

interface ReservationPointSectionProps {
  remainingPoint: number
  usedPoint: number
  finalPaymentAmount: number
  onPointInputChange: (value: string) => void
  onUseAllPointsClick: () => void
}

export const ReservationPointSection = ({
  remainingPoint,
  usedPoint,
  finalPaymentAmount,
  onPointInputChange,
  onUseAllPointsClick,
}: ReservationPointSectionProps) => {
  const handlePointInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onPointInputChange(event.target.value)
  }

  return (
    <section aria-labelledby="reservation-point-heading">
      <div className="px-5 pt-[43px] pb-5.75">
        <div className="flex h-[19px] items-center justify-between pl-1.5">
          <div className="flex items-end gap-1.5">
            <HashiPointMarkIcon
              aria-hidden="true"
              className="h-[18.512px] w-[17px] shrink-0"
            />
            <h2
              className="typo-sub-header-3 text-black"
              id="reservation-point-heading"
            >
              포인트
            </h2>
          </div>
          <p className="typo-sub-header-3 text-primary-200">
            {formatWon(remainingPoint)}
          </p>
        </div>

        <div className="mt-[12.512px] flex h-[46px] gap-2.5">
          <input
            aria-label="사용 포인트"
            className="border-warm-gray-100 typo-sub-header-2 text-primary-200 placeholder:text-warm-gray-300 h-[46px] min-w-0 flex-1 rounded-[5px] border bg-white px-4 text-right outline-none focus-visible:border-black"
            inputMode="numeric"
            onChange={handlePointInputChange}
            value={formatWon(usedPoint, { useGrouping: false })}
          />
          <Button
            className="typo-body-6 h-[46px] w-[94px] px-0"
            onClick={onUseAllPointsClick}
            size="lg"
          >
            전액사용
          </Button>
        </div>

        <div className="border-warm-gray-100 mt-[22px] flex items-center justify-between border-t px-[5px] py-5">
          <span className="typo-body-3 text-black">최종 결제 금액</span>
          <strong className="typo-sub-header-3 text-black">
            {formatWon(finalPaymentAmount, { useGrouping: false })}
          </strong>
        </div>
      </div>

      <div aria-hidden="true" className="bg-warm-gray-50 h-2 w-full" />
    </section>
  )
}
