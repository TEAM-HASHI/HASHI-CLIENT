import type {
  NewsNotification,
  NotificationDestination,
} from '@/pages/notifications/news/types'

const koreanDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export const formatNotificationTime = (
  createdAt: string,
  now: number,
): string => {
  const timestamp = Date.parse(createdAt)
  if (!Number.isFinite(timestamp) || !Number.isFinite(now)) return '-'
  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000))
  if (seconds < 60) return '방금 전'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}일 전`
  const parts = koreanDate.formatToParts(timestamp)
  return ['year', 'month', 'day']
    .map((type) => parts.find((part) => part.type === type)?.value)
    .join('.')
}

export const getNotificationDestination = (
  notification: NewsNotification,
): NotificationDestination => {
  switch (notification.kind) {
    case 'pointsGranted':
      return { kind: 'mypage' }
    case 'reservationUnavailable':
      return {
        kind: 'reservationAlternatives',
        reservationId: notification.reservationId,
      }
    case 'paymentRequested':
    case 'paymentReminder':
      return {
        kind:
          notification.paymentState === 'awaiting'
            ? 'paymentInfo'
            : 'reservationDetail',
        reservationId: notification.reservationId,
      }
    case 'reviewRequested':
      return notification.isReviewWritten
        ? {
            kind: 'reservationDetail',
            reservationId: notification.reservationId,
          }
        : {
            kind: 'reviewWrite',
            reservationId: notification.reservationId,
            restaurantId: notification.restaurantId,
          }
    default:
      return {
        kind: 'reservationDetail',
        reservationId: notification.reservationId,
      }
  }
}
