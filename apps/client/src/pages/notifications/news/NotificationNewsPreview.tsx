import { Button } from '@hashi/hds-ui'
import { useEffect, useRef, useState } from 'react'

import {
  NotificationLayout,
  NotificationLoadError,
  type NotificationTab,
} from '@/features/notification/components'
import { NotificationNewsPanel } from '@/pages/notifications/news/NotificationNewsPanel'
import { createNotificationNewsFixtures } from '@/pages/notifications/news/fixtures'
import type {
  NotificationDestination,
  NotificationNewsState,
} from '@/pages/notifications/news/types'
import '@/app/styles/global.css'

/** Vite 별도 HTML entry. 제품 route에서 import하지 않는다. */
export const NotificationNewsPreview = () => {
  const scenario =
    new URLSearchParams(window.location.search).get('state') ?? 'list'
  const [now, setNow] = useState(Date.now)
  const [fixtures] = useState(() => createNotificationNewsFixtures(now))
  const [activeTab, setActiveTab] = useState<NotificationTab>('news')
  const [mode, setMode] = useState(scenario)
  const [visibleCount, setVisibleCount] = useState(10)
  const [readIds, setReadIds] = useState(
    () => new Set(scenario === 'read' ? [fixtures[0].id] : []),
  )
  const [destination, setDestination] =
    useState<NotificationDestination | null>(null)
  const scrollRef = useRef<HTMLElement>(null)
  const savedScroll = useRef(0)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000)
    return () => window.clearInterval(timer)
  }, [])

  const getState = (): NotificationNewsState => {
    if (mode === 'guest') return { status: 'guest' }
    if (mode === 'loading') return { status: 'loading' }
    if (mode === 'error') return { status: 'error' }
    const notifications =
      mode === 'empty'
        ? []
        : fixtures.slice(0, visibleCount).map((notification, index) => ({
            ...notification,
            isRead: readIds.has(notification.id),
            ...(mode === 'long' && index === 0
              ? {
                  title:
                    '아주 긴 식당 이름과 예약 안내가 있을 때에도 제목과 날짜가 서로 겹치지 않는지 확인해 주세요',
                  description:
                    '아주 긴 식당 이름과 예약 내용을 좁은 화면에서도 빠짐없이 읽을 수 있도록 줄을 바꿔 표시합니다.',
                  createdAt: new Date(now - 8 * 86400000).toISOString(),
                }
              : {}),
          }))
    return {
      status: 'success',
      notifications,
      hasNextPage: visibleCount < fixtures.length,
      isFetchingNextPage: false,
      isFetchNextPageError: mode === 'more-error',
    }
  }
  const restoreList = () => {
    setDestination(null)
    requestAnimationFrame(() =>
      scrollRef.current?.scrollTo({ top: savedScroll.current }),
    )
  }
  return (
    <main ref={scrollRef} data-page-scroll className="app-page-scroll">
      <div className="app-page-scroll-content">
        <NotificationLayout
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onBack={destination ? restoreList : () => window.history.back()}
        >
          {activeTab === 'notice' ? (
            <div className="px-5 pt-30 text-center">
              <p>서비스 공지는 261번 검수 화면에서 확인할 수 있어요.</p>
              <Button onClick={() => setActiveTab('news')}>
                소식 알림으로 돌아가기
              </Button>
            </div>
          ) : destination ? (
            <div className="px-5 pt-20">
              <h2 className="typo-sub-header-1">연결 동작 검수</h2>
              <p className="typo-body-7 mt-3">
                실제 예약 API를 호출하지 않고 선택 목적지 이벤트를 확인하는 개발
                화면입니다.
              </p>
              <pre className="mt-4 overflow-auto text-xs">
                {JSON.stringify(destination, null, 2)}
              </pre>
              <Button className="mt-5" onClick={restoreList}>
                알림 목록으로 돌아가기
              </Button>
            </div>
          ) : (
            <NotificationNewsPanel
              state={getState()}
              now={now}
              onLogin={() => setMode('empty')}
              onRetry={() => setMode('list')}
              onLoadMore={() => {
                setMode((current) =>
                  current === 'more-error' ? 'list' : current,
                )
                setVisibleCount((count) =>
                  Math.min(count + 10, fixtures.length),
                )
              }}
              onSelect={(notification, target) => {
                savedScroll.current = scrollRef.current?.scrollTop ?? 0
                setReadIds((current) => new Set([...current, notification.id]))
                setDestination(target)
                scrollRef.current?.scrollTo({ top: 0 })
              }}
              renderError={(onRetry) => (
                <NotificationLoadError onRetry={onRetry} />
              )}
            />
          )}
        </NotificationLayout>
      </div>
    </main>
  )
}
