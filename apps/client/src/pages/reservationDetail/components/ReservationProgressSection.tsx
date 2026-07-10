import { ReservationRestaurantSummary } from '@/pages/reservationDetail/components/ReservationRestaurantSummary'
import { cn } from '@/shared/utils'

export type ReservationProgressStatus = 'completed' | 'current' | 'pending'

export type ReservationProgressStep = {
  id: string
  title: string
  description: string
  requestedAt?: string
  status: ReservationProgressStatus
}

export type ReservationProgressSectionProps = {
  requestedDate: string
  requestedLabel: string
  restaurant: {
    name: string
    localName: string
    imageSrc?: string
  }
  steps: readonly ReservationProgressStep[]
}

const stepStyleMap: Record<
  ReservationProgressStatus,
  {
    dot: string
    title: string
    time: string
    description: string
  }
> = {
  completed: {
    dot: 'border-cool-gray-900 border-4 bg-white',
    title: 'text-cool-gray-900',
    time: 'text-cool-gray-600',
    description: 'text-primary-200',
  },
  current: {
    dot: 'border-primary-400 border-4 bg-white',
    title: 'text-cool-gray-900',
    time: 'text-primary-200',
    description: 'text-primary-200',
  },
  pending: {
    dot: 'bg-warm-gray-100',
    title: 'text-warm-gray-300',
    time: 'text-warm-gray-300',
    description: 'text-warm-gray-300',
  },
}

const getConnectorClassName = (
  step: ReservationProgressStep,
  nextStep: ReservationProgressStep,
) => {
  const isContactingCurrentStep =
    nextStep.id === 'contacting' && nextStep.status === 'current'

  if (step.status === 'completed' && isContactingCurrentStep) {
    return 'bg-gradient-to-b from-cool-gray-900 to-primary-400'
  }

  if (step.status === 'completed' && nextStep.status === 'completed') {
    return 'bg-cool-gray-900'
  }

  return 'bg-warm-gray-300'
}

const getStepDescription = (step: ReservationProgressStep) => {
  if (step.id !== 'confirmed') {
    return step.description
  }

  return step.status === 'completed'
    ? '예약이 성공적으로 확정되었어요'
    : '식당 확인 후 예약 결과를 알려드릴게요'
}

const getStepDotClassName = (step: ReservationProgressStep) => {
  if (step.id === 'received' && step.status === 'current') {
    return stepStyleMap.completed.dot
  }

  return stepStyleMap[step.status].dot
}

export const ReservationProgressSection = ({
  requestedDate,
  requestedLabel,
  restaurant,
  steps,
}: ReservationProgressSectionProps) => {
  return (
    <section className="pt-5 pb-7">
      <ReservationRestaurantSummary
        requestedDate={requestedDate}
        requestedLabel={requestedLabel}
        restaurant={restaurant}
      />

      <ol>
        {steps.map((step, index) => {
          const nextStep = steps[index + 1]
          const stepStyle = stepStyleMap[step.status]
          const isContactingCurrentStep =
            step.id === 'contacting' && step.status === 'current'

          return (
            <li
              className="relative flex items-center gap-3 pb-4 last:pb-0"
              key={step.id}
            >
              {nextStep ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute top-[calc(50%-4px)] left-[6.5px] z-0 h-[calc(100%-4px)] w-px',
                    getConnectorClassName(step, nextStep),
                  )}
                  data-testid={`reservation-progress-connector-${step.id}`}
                />
              ) : null}
              <span
                aria-hidden="true"
                className={cn(
                  'z-raised relative size-3.5 shrink-0 rounded-full',
                  getStepDotClassName(step),
                  isContactingCurrentStep &&
                    'text-primary-400 animate-reservation-progress-dot',
                )}
                data-testid={`reservation-progress-dot-${step.id}`}
              />
              <div
                className={cn(
                  'min-w-0 flex-1 rounded-[5px] px-4 py-[8.5px]',
                  step.status === 'current' && 'bg-cool-gray-50',
                )}
              >
                <div className="flex items-start justify-between">
                  <p
                    className={cn('typo-sub-header-2 min-w-0', stepStyle.title)}
                  >
                    {step.title}
                  </p>
                  {step.requestedAt ? (
                    <time
                      className={cn('typo-caption-2 shrink-0', stepStyle.time)}
                    >
                      {step.requestedAt}
                    </time>
                  ) : null}
                </div>
                <p className={cn('typo-body-8 mt-px', stepStyle.description)}>
                  {getStepDescription(step)}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
