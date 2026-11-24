import { Button } from '@hashi/hds-ui'
import type { ReactNode } from 'react'

import { NewsEmptyState } from '@/pages/notifications/news/components/NewsEmptyState'
import { NewsNotificationItem } from '@/pages/notifications/news/components/NewsNotificationItem'
import type {
  NewsNotification,
  NotificationDestination,
  NotificationNewsState,
} from '@/pages/notifications/news/types'
import emptyBook from '@/shared/assets/images/empty.webp'
import { KakaoStartButton } from '@/shared/components/kakaoStartButton'
import { useInfiniteScrollTrigger } from '@/shared/hooks/useInfiniteScrollTrigger'

export interface NotificationNewsPanelProps {
  state: NotificationNewsState
  now: number
  onSelect: (
    notification: NewsNotification,
    destination: NotificationDestination,
  ) => void
  onLogin: () => void
  onRetry: () => void
  onLoadMore: () => void | Promise<unknown>
  /** 261번 알림 공통 오류 UI를 호출부에서 조립한다. */
  renderError: (onRetry: () => void) => ReactNode
}

export const NotificationNewsPanel = ({
  state,
  now,
  onSelect,
  onLogin,
  onRetry,
  onLoadMore,
  renderError,
}: NotificationNewsPanelProps) => {
  const loadMoreRef = useInfiniteScrollTrigger<HTMLDivElement>({
    enabled:
      state.status === 'success' &&
      state.hasNextPage &&
      !state.isFetchNextPageError,
    isLoading: state.status === 'success' && state.isFetchingNextPage,
    onIntersect: onLoadMore,
  })

  if (state.status === 'guest')
    return (
      <div className="flex flex-col items-center px-5 pt-40 text-center">
        <img
          alt=""
          aria-hidden="true"
          src={emptyBook}
          className="h-19 w-25.25 shrink-0"
        />
        <h2 className="typo-sub-header-1 text-cool-gray-900 mt-7">
          로그인하고 소식을 확인해 보세요
        </h2>
        <p className="typo-body-8 text-cool-gray-500 mt-3">
          예약 진행 상황부터 포인트 지급까지
          <br />
          Hashi의 소식을 알려드릴게요.
        </p>
        <KakaoStartButton className="mt-5 max-w-full" onPress={onLogin}>
          카카오로 로그인하기
        </KakaoStartButton>
      </div>
    )
  if (state.status === 'loading')
    return (
      <p
        role="status"
        className="typo-body-7 text-cool-gray-500 px-5 pt-50 text-center"
      >
        알림을 불러오고 있어요.
      </p>
    )
  if (state.status === 'error')
    return <div className="px-5 pt-50">{renderError(onRetry)}</div>
  if (state.notifications.length === 0) return <NewsEmptyState />

  return (
    <section aria-label="소식 알림" className="px-5 pb-10">
      <ul aria-label="소식 알림 목록">
        {state.notifications.map((notification) => (
          <NewsNotificationItem
            key={notification.id}
            notification={notification}
            now={now}
            onSelect={onSelect}
          />
        ))}
      </ul>
      {state.isFetchNextPageError && !state.isFetchingNextPage ? (
        <div className="pt-30 pb-10">
          {renderError(() => {
            void onLoadMore()
          })}
        </div>
      ) : null}
      {state.isFetchingNextPage ? (
        <p
          role="status"
          className="typo-caption-1 text-cool-gray-500 py-5 text-center"
        >
          알림을 더 불러오고 있어요.
        </p>
      ) : null}
      {state.hasNextPage &&
      !state.isFetchNextPageError &&
      !state.isFetchingNextPage ? (
        <div ref={loadMoreRef} className="flex min-h-10 justify-center">
          <Button
            className="sr-only focus:not-sr-only"
            onClick={() => {
              void onLoadMore()
            }}
            variant="neutral"
            size="sm"
          >
            알림 더 보기
          </Button>
        </div>
      ) : null}
    </section>
  )
}
