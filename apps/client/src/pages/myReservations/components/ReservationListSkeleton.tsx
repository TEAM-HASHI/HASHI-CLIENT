import type { ReservationStatusFilterValue } from '@/pages/myReservations/constants/reservationStatus'
import { cn } from '@/shared/utils'

type ReservationListSkeletonProps = {
  selectedStatus: ReservationStatusFilterValue
}

const skeletonBlockClassName = 'bg-secondary-200 animate-pulse rounded-[4px]'

const InProgressReservationSkeleton = () => {
  return (
    <article className="border-warm-gray-100 overflow-hidden rounded-[10px] border bg-white">
      <div className="border-warm-gray-100 flex items-center gap-1 border-b px-5 py-2.5">
        <div className={cn(skeletonBlockClassName, 'size-4 shrink-0')} />
        <div className={cn(skeletonBlockClassName, 'h-5 w-48')} />
      </div>

      <div className="px-4.5 pt-6 pb-5">
        <div className="flex gap-3">
          <div className={cn(skeletonBlockClassName, 'size-[60px] shrink-0')} />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className={cn(skeletonBlockClassName, 'h-6 w-full')} />
            <div className={cn(skeletonBlockClassName, 'h-4 w-32')} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex flex-col items-center gap-1.5">
              <div
                className={cn(skeletonBlockClassName, 'size-6 rounded-full')}
              />
              <div className={cn(skeletonBlockClassName, 'h-4 w-16')} />
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className={cn(skeletonBlockClassName, 'h-12.5 rounded-[5px]')} />
          <div className={cn(skeletonBlockClassName, 'h-12.5 rounded-[5px]')} />
        </div>
      </div>
    </article>
  )
}

const DefaultReservationSkeleton = () => {
  return (
    <article className="border-secondary-200 border-b pb-4 last:border-b-0 last:pb-0">
      <div className="flex gap-3">
        <div
          className={cn(
            skeletonBlockClassName,
            'size-23 shrink-0 rounded-[5px]',
          )}
        />
        <div className="flex min-w-0 flex-1 flex-col pt-0.5">
          <div className={cn(skeletonBlockClassName, 'h-6 w-full')} />
          <div className={cn(skeletonBlockClassName, 'mt-2 h-4 w-40')} />
          <div className={cn(skeletonBlockClassName, 'mt-1 h-4 w-24')} />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className={cn(skeletonBlockClassName, 'h-11 rounded-[5px]')} />
        <div className={cn(skeletonBlockClassName, 'h-11 rounded-[5px]')} />
      </div>
    </article>
  )
}

export const ReservationListSkeleton = ({
  selectedStatus,
}: ReservationListSkeletonProps) => {
  const skeletonItems = Array.from({ length: 3 }, (_, index) => index)

  return (
    <div
      aria-hidden="true"
      className="mb-2 flex flex-col gap-4"
      data-testid="my-reservations-skeleton"
    >
      {skeletonItems.map((index) =>
        selectedStatus === 'IN_PROGRESS' ? (
          <InProgressReservationSkeleton key={index} />
        ) : (
          <DefaultReservationSkeleton key={index} />
        ),
      )}
    </div>
  )
}
