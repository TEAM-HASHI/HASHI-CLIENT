import { NotificationLoadError } from '@/features/notification/components/NotificationLoadError'
import type {
  ServiceNotice,
  ServiceNoticeType,
} from '@/pages/notifications/types'
import { useInfiniteScrollTrigger } from '@/shared/hooks/useInfiniteScrollTrigger'
import { cn } from '@/shared/utils'

const noticeStyles: Record<
  ServiceNoticeType,
  { label: string; className: string }
> = {
  notice: { label: '공지', className: 'bg-cool-gray-800 text-secondary-200' },
  event: {
    label: '이벤트',
    className: 'border-primary-400 text-primary-400 border',
  },
  update: { label: '업데이트', className: 'bg-cool-gray-100 text-primary-200' },
}

interface ServiceNoticeListProps {
  notices: ServiceNotice[]
  hasNext: boolean
  isNextError: boolean
  onSelect: (notice: ServiceNotice) => void
  onLoadMore: () => void
  onRetry: () => void
}

export const ServiceNoticeList = ({
  notices,
  hasNext,
  isNextError,
  onSelect,
  onLoadMore,
  onRetry,
}: ServiceNoticeListProps) => {
  const loadMoreRef = useInfiniteScrollTrigger<HTMLDivElement>({
    enabled: hasNext && !isNextError,
    onIntersect: onLoadMore,
  })

  return (
    <>
      <ul aria-label="서비스 공지 목록" className="px-5">
        {notices.map((notice) => {
          const style = noticeStyles[notice.type]
          return (
            <li className="border-warm-gray-100 h-26 border-b" key={notice.id}>
              <button
                className="flex h-full w-full min-w-0 flex-col items-start justify-center gap-2.75 text-left focus-visible:outline-2 focus-visible:outline-offset-2"
                data-read={notice.isRead}
                onClick={() => onSelect(notice)}
                type="button"
              >
                <span
                  className={cn(
                    'typo-caption-5 inline-flex min-h-4.5 items-center rounded-[30px] px-1.5 py-0.5 leading-[1.38]',
                    notice.isRead
                      ? 'bg-secondary-200 text-warm-gray-300'
                      : style.className,
                  )}
                >
                  {style.label}
                </span>
                <span className="flex w-full min-w-0 flex-col gap-2">
                  <span
                    className={cn(
                      'typo-sub-header-3 block w-full truncate',
                      notice.isRead ? 'text-warm-gray-300' : 'text-black',
                    )}
                  >
                    {notice.title}
                  </span>
                  <span className="typo-body-7 text-warm-gray-300">
                    {notice.displayDate}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      {isNextError ? (
        <NotificationLoadError className="pt-25 pb-10" onRetry={onRetry} />
      ) : hasNext ? (
        <div aria-hidden="true" className="h-px" ref={loadMoreRef} />
      ) : null}
    </>
  )
}
