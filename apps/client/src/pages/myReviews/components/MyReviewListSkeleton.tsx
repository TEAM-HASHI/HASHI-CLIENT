import { cn } from '@/shared/utils'

type MyReviewListSkeletonProps = {
  variant: 'writable' | 'written'
}

const skeletonBlockClassName = 'bg-secondary-200 animate-pulse rounded-[4px]'

const ReviewCardContentSkeleton = () => {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className={cn(skeletonBlockClassName, 'size-[92px] shrink-0')} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className={cn(skeletonBlockClassName, 'h-6 w-full')} />
        <div className={cn(skeletonBlockClassName, 'mt-2 h-4 w-32')} />
        <div className={cn(skeletonBlockClassName, 'mt-1 h-4 w-24')} />
      </div>
    </div>
  )
}

const WritableReviewSkeleton = () => {
  return (
    <article className="flex min-w-0 flex-col gap-3">
      <ReviewCardContentSkeleton />
      <div className={cn(skeletonBlockClassName, 'h-9 rounded-[5px]')} />
    </article>
  )
}

const WrittenReviewSkeleton = () => {
  return (
    <article className="border-warm-gray-50 flex h-[120px] min-w-0 items-center gap-3 border-b">
      <ReviewCardContentSkeleton />
      <div className={cn(skeletonBlockClassName, 'size-[18px] shrink-0')} />
    </article>
  )
}

export const MyReviewListSkeleton = ({
  variant,
}: MyReviewListSkeletonProps) => {
  return (
    <div
      aria-hidden="true"
      className="flex min-w-0 flex-col gap-3 px-5 pt-5"
      data-testid="my-review-list-skeleton"
    >
      {Array.from({ length: 3 }, (_, index) =>
        variant === 'writable' ? (
          <WritableReviewSkeleton key={index} />
        ) : (
          <WrittenReviewSkeleton key={index} />
        ),
      )}
    </div>
  )
}
