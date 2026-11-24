import { CalendarIcon, MoneyIcon } from '@hashi/hds-icons'

import canceled from '@/pages/notifications/news/assets/canceled.png'
import checking from '@/pages/notifications/news/assets/checking.png'
import confirmed from '@/pages/notifications/news/assets/confirmed.png'
import newTime from '@/pages/notifications/news/assets/new-time.png'
import payment from '@/pages/notifications/news/assets/payment.svg'
import paymentReminder from '@/pages/notifications/news/assets/payment-reminder.svg'
import points from '@/pages/notifications/news/assets/points.svg'
import review from '@/pages/notifications/news/assets/review.svg'
import unavailable from '@/pages/notifications/news/assets/unavailable.png'
import visit from '@/pages/notifications/news/assets/visit.png'
import type { NewsNotification } from '@/pages/notifications/news/types'
import { cn } from '@/shared/utils'

const images = {
  newTimeRequested: newTime,
  reservationChecking: checking,
  reservationConfirmed: confirmed,
  paymentRequested: payment,
  paymentReminder,
  reservationUnavailable: unavailable,
  visitReminder: visit,
  canceledByUser: canceled,
  canceledByRestaurant: canceled,
  paymentExpired: canceled,
  reviewRequested: review,
  pointsGranted: points,
} as const

export const NewsNotificationIcon = ({
  kind,
  isRead,
}: Pick<NewsNotification, 'kind' | 'isRead'>) => {
  const renderIcon = () => {
    if (kind === 'reservationRequested')
      return <CalendarIcon className="size-6" />
    if (kind === 'feeRefunded') return <MoneyIcon className="size-6" />
    // The two review SVGs retain their exported 20px dimensions inside a 24px slot.
    const isReviewIcon = kind === 'reviewRequested' || kind === 'pointsGranted'
    return (
      <span className="flex size-6 items-center justify-end">
        <img
          alt=""
          src={images[kind]}
          className={isReviewIcon ? 'shrink-0' : 'size-6 shrink-0'}
        />
      </span>
    )
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        'bg-secondary-200 flex size-8.5 shrink-0 items-center justify-center rounded-full',
        isRead && 'opacity-45 grayscale',
      )}
    >
      {renderIcon()}
    </span>
  )
}
