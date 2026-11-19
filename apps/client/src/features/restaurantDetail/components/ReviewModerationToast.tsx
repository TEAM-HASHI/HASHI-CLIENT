import { CheckIcon } from '@hashi/hds-icons'
import { showToast } from '@hashi/hds-ui'

import '@/features/restaurantDetail/components/ReviewModerationToast.css'

export const showReviewModerationSuccess = (message: string) => {
  const now = new Date()
  const date = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long' }).format(
    now,
  )

  showToast({
    icon: <CheckIcon className="text-success size-full" />,
    children: (
      <span data-review-moderation-toast>
        <span className="block">{message}</span>
        <time className="block" dateTime={now.toISOString()}>
          {date}
        </time>
      </span>
    ),
  })
}
