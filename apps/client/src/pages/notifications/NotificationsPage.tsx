import { showToast } from '@hashi/hds-ui'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import {
  NotificationHeader,
  NotificationLayout,
  NotificationLoadError,
  type NotificationTab,
} from '@/features/notification/components'
import { NotificationNewsPanel } from '@/pages/notifications/components/news/NotificationNewsPanel'
import { useNotificationNews } from '@/pages/notifications/hooks/useNotificationNews'
import { ServiceNoticeDetail } from '@/pages/notifications/components/notice/ServiceNoticeDetail'
import { ServiceNoticeList } from '@/pages/notifications/components/notice/ServiceNoticeList'
import { SERVICE_NOTICE_FIXTURES } from '@/pages/notifications/data/serviceNoticeFixtures'
import type { ServiceNotice } from '@/pages/notifications/types/serviceNotice'
import warningIcon from '@/shared/assets/icons/map-toast-warning.svg'
import { PageFixedArea } from '@/shared/components/pageFixedArea/PageFixedArea'
import { useAuthStatus } from '@/shared/hooks/useAuthStatus'
import { getPageScrollY, scrollPageTo } from '@/shared/utils/pageScroll'

const PAGE_SIZE = 10

export const NotificationsPage = () => {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuthStatus()
  const preview = import.meta.env.DEV ? params.get('preview') : null
  const isMember =
    isAuthenticated ||
    (import.meta.env.DEV && params.get('previewUser') === 'member')
  const news = useNotificationNews(isMember)
  const newsScroll = useRef(0)
  const noticeParam = params.get('notice')
  const selectedNotice = SERVICE_NOTICE_FIXTURES.find(
    (notice) => String(notice.id) === noticeParam,
  )
  const activeTab =
    noticeParam || params.get('tab') === 'notice' ? 'notice' : 'news'
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [readIds, setReadIds] = useState(
    () =>
      new Set([
        ...SERVICE_NOTICE_FIXTURES.filter((notice) => notice.isRead).map(
          (notice) => notice.id,
        ),
        ...(isMember && selectedNotice && preview !== 'detail-error'
          ? [selectedNotice.id]
          : []),
      ]),
  )
  const [removedIds, setRemovedIds] = useState<number[]>([])
  const listScroll = useRef(0)
  const previousView = useRef<string | null>(null)
  const isDetailError = !!selectedNotice && preview === 'detail-error'

  const showUnavailable = () =>
    showToast({
      children: '확인할 수 없는 공지예요',
      icon: (
        <img
          alt=""
          aria-hidden="true"
          className="size-full"
          src={warningIcon}
        />
      ),
    })

  useEffect(() => {
    if (!noticeParam || selectedNotice) return
    showUnavailable()
    const next = new URLSearchParams(params)
    next.delete('notice')
    next.set('tab', 'notice')
    setParams(next, { replace: true })
  }, [noticeParam, params, selectedNotice, setParams])

  useLayoutEffect(() => {
    const view = noticeParam ? `detail:${noticeParam}` : activeTab
    if (previousView.current === view) return
    previousView.current = view
    scrollPageTo({
      top: noticeParam
        ? 0
        : activeTab === 'news'
          ? newsScroll.current
          : listScroll.current,
      behavior: 'auto',
    })
  }, [activeTab, noticeParam])

  const handleRetry = () => {
    if (isDetailError && isMember && selectedNotice) {
      setReadIds((ids) => new Set([...ids, selectedNotice.id]))
    }
    if (preview === 'more-error') {
      setVisibleCount((count) =>
        Math.min(count + PAGE_SIZE, SERVICE_NOTICE_FIXTURES.length),
      )
    }
    const next = new URLSearchParams(params)
    next.delete('preview')
    setParams(next, { replace: true, state: location.state })
  }

  const handleSelect = (notice: ServiceNotice) => {
    if (preview === 'unavailable' && notice.id === 1) {
      setRemovedIds((ids) => [...ids, notice.id])
      showUnavailable()
      return
    }
    listScroll.current = getPageScrollY()
    if (isMember && preview !== 'detail-error')
      setReadIds((ids) => new Set([...ids, notice.id]))
    const next = new URLSearchParams(params)
    next.set('tab', 'notice')
    next.set('notice', String(notice.id))
    setParams(next, { state: { notificationNoticeOpened: true } })
  }

  const handleBack = () => {
    if (noticeParam) {
      if (
        (location.state as { notificationNoticeOpened?: boolean } | null)
          ?.notificationNoticeOpened
      ) {
        navigate(-1)
      } else {
        const next = new URLSearchParams(params)
        next.delete('notice')
        next.set('tab', 'notice')
        setParams(next, { replace: true })
      }
    } else if (window.history.state?.idx > 0) {
      navigate(-1)
    } else {
      navigate(ROUTES.home, { replace: true })
    }
  }

  const notices = SERVICE_NOTICE_FIXTURES.filter(
    (notice) => !removedIds.includes(notice.id),
  )
  const displayedNotices = notices.slice(0, visibleCount).map((notice) => ({
    ...notice,
    isRead: isMember && readIds.has(notice.id),
  }))

  const renderContent = () => {
    if (selectedNotice) {
      return isDetailError ? (
        <NotificationLoadError className="pt-50" onRetry={handleRetry} />
      ) : (
        <ServiceNoticeDetail key={selectedNotice.id} notice={selectedNotice} />
      )
    }
    if (activeTab === 'news') {
      if (news.state)
        return (
          <NotificationNewsPanel
            {...news}
            state={news.state}
            renderError={(onRetry) => (
              <NotificationLoadError onRetry={onRetry} />
            )}
          />
        )
      return (
        <p className="typo-body-7 text-warm-gray-300 px-5 pt-50 text-center">
          소식 알림은 준비 중이에요.
        </p>
      )
    }
    if (preview === 'error') {
      return <NotificationLoadError className="pt-50" onRetry={handleRetry} />
    }
    return (
      <ServiceNoticeList
        hasNext={visibleCount < notices.length}
        isNextError={preview === 'more-error'}
        notices={displayedNotices}
        onLoadMore={() =>
          setVisibleCount((count) =>
            Math.min(count + PAGE_SIZE, notices.length),
          )
        }
        onRetry={handleRetry}
        onSelect={handleSelect}
      />
    )
  }

  const handleTabChange = (tab: NotificationTab) => {
    if (activeTab === 'notice') listScroll.current = getPageScrollY()
    else newsScroll.current = getPageScrollY()
    const next = new URLSearchParams(params)
    next.set('tab', tab)
    setParams(next, { replace: true })
  }

  if (selectedNotice) {
    return (
      <div className="min-h-dvh bg-white pt-18.75">
        <PageFixedArea>
          <div
            className="app-mobile-fixed-top z-fixed bg-white"
            data-page-scroll-top
          >
            <NotificationHeader
              elevated
              onBack={handleBack}
              title="서비스 공지"
            />
          </div>
        </PageFixedArea>
        {renderContent()}
      </div>
    )
  }

  return (
    <NotificationLayout
      activeTab={activeTab}
      onBack={handleBack}
      onTabChange={handleTabChange}
    >
      {renderContent()}
    </NotificationLayout>
  )
}
