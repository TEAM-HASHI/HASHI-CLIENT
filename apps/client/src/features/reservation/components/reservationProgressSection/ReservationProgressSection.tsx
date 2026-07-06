import { cn } from '@/shared/utils'

import { ReservationRestaurantSummary } from './ReservationRestaurantSummary'

export type ReservationProgressStatus = 'completed' | 'current' | 'pending'

export type ReservationProgressStep = {
  id: string
  title: string
  description: string
  requestedAt: string
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
    innerDot?: string
    title: string
    time: string
    description: string
  }
> = {
  completed: {
    dot: 'bg-warm-gray-100',
    innerDot: 'bg-white',
    title: 'text-warm-gray-300',
    time: 'text-cool-gray-500',
    description: 'text-warm-gray-300',
  },
  current: {
    dot: 'border-cool-gray-900 border-4 bg-white',
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
          const isLastStep = index === steps.length - 1
          const stepStyle = stepStyleMap[step.status]

          return (
            <li
              className="relative flex items-center gap-3 pb-4 last:pb-0"
              key={step.id}
            >
              {!isLastStep ? (
                <span
                  aria-hidden="true"
                  className="bg-warm-gray-300 absolute top-1/2 left-[6.5px] h-full w-px"
                />
              ) : null}
              <span
                aria-hidden="true"
                className={cn(
                  'relative flex size-3.5 shrink-0 items-center justify-center rounded-full',
                  stepStyle.dot,
                )}
              >
                {stepStyle.innerDot ? (
                  <span
                    className={cn('size-1.5 rounded-full', stepStyle.innerDot)}
                  />
                ) : null}
              </span>
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
                  <time
                    className={cn('typo-caption-2 shrink-0', stepStyle.time)}
                  >
                    {step.requestedAt}
                  </time>
                </div>
                <p className={cn('typo-body-8 mt-px', stepStyle.description)}>
                  {step.description}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
