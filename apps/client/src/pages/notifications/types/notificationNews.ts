/** 퍼블리싱 표시 모델. 확정되지 않은 서버 DTO와 구분한다. */
interface NewsNotificationBase {
  id: string
  title: string
  description: string
  createdAt: string
  isRead: boolean
}

type ReservationNewsKind =
  | 'reservationRequested'
  | 'newTimeRequested'
  | 'reservationChecking'
  | 'feeRefunded'
  | 'reservationConfirmed'
  | 'reservationUnavailable'
  | 'visitReminder'
  | 'canceledByUser'
  | 'canceledByRestaurant'
  | 'paymentExpired'

export type NewsNotification = NewsNotificationBase &
  (
    | { kind: ReservationNewsKind; reservationId: string }
    | {
        kind: 'paymentRequested' | 'paymentReminder'
        reservationId: string
        paymentState: 'awaiting' | 'paid' | 'expired'
      }
    | {
        kind: 'reviewRequested'
        reservationId: string
        restaurantId: string
        isReviewWritten: boolean
      }
    | { kind: 'pointsGranted' }
  )

export type NotificationDestination =
  | {
      kind: 'reservationDetail' | 'paymentInfo' | 'reservationAlternatives'
      reservationId: string
    }
  | { kind: 'reviewWrite'; reservationId: string; restaurantId: string }
  | { kind: 'mypage' }

export type NotificationNewsState =
  | { status: 'guest' }
  | { status: 'loading' }
  | { status: 'error' }
  | {
      status: 'success'
      notifications: NewsNotification[]
      hasNextPage: boolean
      isFetchingNextPage: boolean
      isFetchNextPageError: boolean
    }
