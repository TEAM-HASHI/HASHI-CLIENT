import { showToast } from '@hashi/hds-ui'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { useKakaoOAuthStart } from '@/features/auth/hooks/useKakaoOAuthStart'
import { createNotificationNewsFixtures } from '@/pages/notifications/data/notificationNewsFixtures'
import type {
  NewsNotification,
  NotificationDestination,
  NotificationNewsState,
} from '@/pages/notifications/types/notificationNews'

const PREVIEW_SCENARIOS = new Set([
  'list',
  'read',
  'empty',
  'guest',
  'loading',
  'error',
  'more-error',
  'long',
])

/** API 통합 전의 페이지 조립. 예시 알림은 명시적인 개발 검수에서만 제공한다. */
export const useNotificationNews = (isMember: boolean) => {
  const [params, setParams] = useSearchParams()
  const scenario = import.meta.env.DEV ? params.get('previewNews') : null
  const isPreview = scenario !== null && PREVIEW_SCENARIOS.has(scenario)
  const { startKakaoOAuth } = useKakaoOAuthStart()
  const [now, setNow] = useState(Date.now)
  const [fixtures] = useState(() =>
    import.meta.env.DEV ? createNotificationNewsFixtures(Date.now()) : [],
  )
  const [visibleCount, setVisibleCount] = useState(10)
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    if (!isPreview) return
    const timer = window.setInterval(() => setNow(Date.now()), 60000)
    return () => window.clearInterval(timer)
  }, [isPreview])

  const getState = (): NotificationNewsState | null => {
    if (!isMember || (isPreview && scenario === 'guest'))
      return { status: 'guest' }
    if (!isPreview) return null
    if (scenario === 'loading') return { status: 'loading' }
    if (scenario === 'error') return { status: 'error' }
    return {
      status: 'success',
      notifications:
        scenario === 'empty'
          ? []
          : fixtures.slice(0, visibleCount).map((notification, index) => ({
              ...notification,
              isRead:
                readIds.has(notification.id) ||
                (scenario === 'read' && index === 0),
              ...(scenario === 'long' && index === 0
                ? {
                    title:
                      '아주 긴 식당 이름과 예약 안내가 있을 때에도 제목과 날짜가 서로 겹치지 않는지 확인해 주세요',
                    description:
                      '아주 긴 식당 이름과 예약 내용을 좁은 화면에서도 빠짐없이 읽을 수 있도록 줄을 바꿔 표시합니다.',
                    createdAt: new Date(now - 8 * 86400000).toISOString(),
                  }
                : {}),
            })),
      hasNextPage: visibleCount < fixtures.length,
      isFetchingNextPage: false,
      isFetchNextPageError: scenario === 'more-error',
    }
  }
  const handleRetry = () => {
    const next = new URLSearchParams(params)
    next.set('previewNews', 'list')
    setParams(next, { replace: true })
  }
  const handleLoadMore = () => {
    if (scenario === 'more-error') handleRetry()
    setVisibleCount((count) => Math.min(count + 10, fixtures.length))
  }
  const handleSelect = (
    notification: NewsNotification,
    destination: NotificationDestination,
  ) => {
    if (!isPreview) return
    setReadIds((ids) => new Set([...ids, notification.id]))
    showToast({ children: `개발 검수: ${destination.kind}` })
  }

  return {
    state: getState(),
    now,
    onSelect: handleSelect,
    onLogin: () => startKakaoOAuth(ROUTES.notifications),
    onRetry: handleRetry,
    onLoadMore: handleLoadMore,
  }
}
