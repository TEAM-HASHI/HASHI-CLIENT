import { cn } from '@/shared/utils'

type CollectionListSkeletonProps = {
  detail: boolean
  compact?: boolean
  count?: number
}

export const CollectionListSkeleton = ({
  detail,
  compact = false,
  count = 3,
}: CollectionListSkeletonProps) => (
  <div
    role="status"
    aria-label={detail ? '저장 식당 목록 로딩 중' : '컬렉션 목록 로딩 중'}
    className="px-5"
  >
    <span className="sr-only">불러오는 중…</span>
    <div
      aria-hidden="true"
      className={!detail && !compact ? 'flex flex-col gap-4 py-4' : undefined}
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className={cn(
            'border-warm-gray-50 flex border-b',
            compact && !detail
              ? 'items-center gap-3 py-4.5'
              : 'items-start gap-4 py-4',
          )}
        >
          <div
            className={cn(
              'bg-secondary-200 shrink-0 animate-pulse rounded-[5px] motion-reduce:animate-none',
              compact && !detail ? 'size-12.5' : 'size-25',
            )}
          />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="bg-secondary-200 h-5 w-3/4 animate-pulse rounded-[4px] motion-reduce:animate-none" />
            <div className="bg-secondary-200 h-4 w-1/2 animate-pulse rounded-[4px] motion-reduce:animate-none" />
          </div>
        </div>
      ))}
    </div>
  </div>
)
