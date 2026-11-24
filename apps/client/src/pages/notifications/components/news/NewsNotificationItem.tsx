import { useId } from 'react'

import { NewsNotificationIcon } from '@/pages/notifications/components/news/NewsNotificationIcon'
import type {
  NewsNotification,
  NotificationDestination,
} from '@/pages/notifications/types/notificationNews'
import {
  formatNotificationTime,
  getNotificationDestination,
} from '@/pages/notifications/utils/notificationNews'
import { cn } from '@/shared/utils'

interface NewsNotificationItemProps {
  notification: NewsNotification
  now: number
  onSelect: (
    notification: NewsNotification,
    destination: NotificationDestination,
  ) => void
}

export const NewsNotificationItem = ({
  notification,
  now,
  onSelect,
}: NewsNotificationItemProps) => {
  const descriptionId = useId()
  const timeId = useId()
  return (
    <li className="border-warm-gray-100 border-b">
      <button
        type="button"
        aria-label={`${notification.isRead ? '읽음' : '안 읽음'}: ${notification.title}`}
        aria-describedby={`${descriptionId} ${timeId}`}
        onClick={() =>
          onSelect(notification, getNotificationDestination(notification))
        }
        className="flex min-h-26 w-full items-center gap-3 py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <NewsNotificationIcon
          kind={notification.kind}
          isRead={notification.isRead}
        />
        <span className="flex min-w-0 flex-1 items-start gap-1">
          <span className="flex min-w-0 flex-1 flex-col gap-2">
            <span
              title={notification.title}
              className={cn(
                'typo-sub-header-3 block truncate text-black',
                notification.isRead && 'text-warm-gray-300',
              )}
            >
              {notification.title}
            </span>
            <span
              id={descriptionId}
              className="typo-body-7 text-warm-gray-300 block break-words whitespace-pre-line"
            >
              {notification.description}
            </span>
          </span>
          <time
            id={timeId}
            dateTime={notification.createdAt}
            className={cn(
              'typo-caption-3 text-cool-gray-500 shrink-0 text-right whitespace-nowrap',
              notification.isRead && 'text-warm-gray-300',
            )}
          >
            {formatNotificationTime(notification.createdAt, now)}
          </time>
        </span>
      </button>
    </li>
  )
}
