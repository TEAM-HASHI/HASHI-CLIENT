import { CheckIcon, ReservationIcon } from '@hashi/hds-icons'
import { Button } from '@hashi/hds-ui'

import { ReservationCardImage } from '@/pages/myReservations/components/ReservationCardImage'
import type { InProgressReservation } from '@/pages/myReservations/types'
import { cn } from '@/shared/utils'

const progressSteps = [
  { label: '예약 접수', value: 'RECEIVED' },
  { label: '예약 진행 중', value: 'CONTACTING' },
  { label: '예약 확정', value: 'CONFIRMED' },
] as const

type InProgressReservationCardProps = {
  reservation: InProgressReservation
  onContactPress: (reservationId: string) => void
  onDetailPress: (reservationId: string) => void
}

export const InProgressReservationCard = ({
  reservation,
  onContactPress,
  onDetailPress,
}: InProgressReservationCardProps) => {
  const currentStepIndex = progressSteps.findIndex(
    (step) => step.value === reservation.progressStep,
  )
  const activeStepIndex = Math.max(currentStepIndex, 0)
  const isContacting = reservation.progressStep === 'CONTACTING'
  const isConfirmed = reservation.progressStep === 'CONFIRMED'

  return (
    <article className="border-warm-gray-100 overflow-hidden rounded-[10px] border bg-white">
      <div className="typo-body-5 border-warm-gray-100 text-primary-200 flex items-center gap-1 border-b px-5 py-2.5">
        <ReservationIcon className="text-primary-200 size-4 shrink-0" />
        <span>
          <strong className="typo-sub-header-3 text-error">
            {reservation.remainingDays}일
          </strong>{' '}
          안에 예약이 확정될 예정이에요!
        </span>
      </div>

      <div className="px-4.5 pt-6 pb-5">
        <div className="flex gap-3">
          <ReservationCardImage
            imageUrl={reservation.restaurantImageUrl}
            restaurantName={reservation.restaurantName}
          />
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="typo-sub-header-2 text-cool-gray-900 line-clamp-2">
              {reservation.restaurantName}
            </h2>
            <p className="typo-body-6 text-cool-gray-600">
              {reservation.requestedAt}
            </p>
          </div>
        </div>

        <ol className="relative mt-4 grid grid-cols-3">
          <span
            className={cn(
              'absolute top-3 left-[16.66%] h-px w-[33.34%]',
              isContacting && 'bg-gradient-progress-line',
              isConfirmed && 'bg-cool-gray-900',
              !isContacting && !isConfirmed && 'bg-warm-gray-50',
            )}
          />
          <span
            className={cn(
              'absolute top-3 left-1/2 h-px w-[33.34%]',
              isConfirmed ? 'bg-cool-gray-900' : 'bg-warm-gray-50',
            )}
          />
          {progressSteps.map((step, index) => {
            const isCompleted = index <= activeStepIndex && !isContacting
            const isCurrent = isContacting && index === activeStepIndex
            const isContactingCompleted =
              isContacting && index < activeStepIndex
            const shouldShowCheck = isCompleted || isContactingCompleted

            return (
              <li
                key={step.value}
                className="relative z-0 flex flex-col items-center gap-1.5"
              >
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full',
                    shouldShowCheck && 'bg-cool-gray-900 text-white',
                    isCurrent && 'border-primary-400 border-[6px] bg-white',
                    !shouldShowCheck && !isCurrent && 'bg-secondary-200',
                  )}
                >
                  {shouldShowCheck ? (
                    <CheckIcon className="size-5 text-white" />
                  ) : null}
                </span>
                <span
                  className={cn(
                    'typo-body-8',
                    shouldShowCheck
                      ? 'text-cool-gray-900'
                      : 'text-warm-gray-100',
                    isCurrent && 'text-primary-400',
                  )}
                >
                  {step.label}
                </span>
              </li>
            )
          })}
        </ol>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button
            onClick={() => onContactPress(reservation.reservationId)}
            size="md"
            variant="neutral"
            width="full"
          >
            문의하기
          </Button>
          <Button
            onClick={() => onDetailPress(reservation.reservationId)}
            size="md"
            variant="primary"
            width="full"
          >
            상세보기
          </Button>
        </div>
      </div>
    </article>
  )
}
