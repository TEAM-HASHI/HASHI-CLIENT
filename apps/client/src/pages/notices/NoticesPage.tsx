import { BackIcon, NextIcon } from '@hashi/hds-icons'
import { Header, IconButton } from '@hashi/hds-ui'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate, useNavigationType } from 'react-router-dom'

import { ROUTES } from '@/app/router/path'
import { getNoticeDetailPath } from '@/app/router/routePaths'
import { getNotices } from '@/features/notice/api/getNotices'
import { noticeQueryKeys } from '@/features/notice/noticeQueryKeys'
import { formatNoticeLastUpdatedDate } from '@/features/notice/utils/formatNoticeDate'
import { LoadingScreen } from '@/shared/components/loadingScreen'
import { useInfiniteScrollTrigger } from '@/shared/hooks'

const NOTICE_PAGE_SIZE = 10

// ponytail: RootLayout이 경로가 바뀔 때마다 맨 위로 스크롤하므로, 공지 목록만 상세에서 돌아올 때
// 마지막 위치를 되살린다. 여러 화면에 필요해지면 라우터 ScrollRestoration으로 옮긴다.
const NOTICE_LIST_SCROLL_KEY = 'hashi:notice-list-state'

const saveNoticeListState = (pageCount: number) => {
  try {
    sessionStorage.setItem(
      NOTICE_LIST_SCROLL_KEY,
      JSON.stringify({ scrollY: window.scrollY, pageCount }),
    )
  } catch {
    // 저장소를 쓸 수 없으면 위치 복원만 건너뛴다.
  }
}

const readNoticeListState = (): {
  scrollY: number
  pageCount: number
} | null => {
  try {
    const saved = sessionStorage.getItem(NOTICE_LIST_SCROLL_KEY)
    if (!saved) return null
    const state = JSON.parse(saved)
    return Number.isFinite(state.scrollY) &&
      state.scrollY >= 0 &&
      Number.isInteger(state.pageCount) &&
      state.pageCount >= 1
      ? state
      : null
  } catch {
    return null
  }
}

export const NoticesPage = () => {
  const navigate = useNavigate()
  const navigationType = useNavigationType()
  const [restoration, setRestoration] = useState(() =>
    navigationType === 'POP' ? readNoticeListState() : null,
  )
  const isRestoring = Boolean(restoration)
  const noticesQuery = useInfiniteQuery({
    queryKey: noticeQueryKeys.infiniteList(NOTICE_PAGE_SIZE),
    queryFn: ({ pageParam }) =>
      getNotices({ cursor: pageParam, size: NOTICE_PAGE_SIZE }),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
  })
  const loadMoreRef = useInfiniteScrollTrigger<HTMLLIElement>({
    enabled:
      !isRestoring &&
      noticesQuery.hasNextPage &&
      !noticesQuery.isFetchNextPageError,
    isLoading: noticesQuery.isFetchingNextPage,
    onIntersect: noticesQuery.fetchNextPage,
  })
  const { data, hasNextPage, isFetching, isFetchNextPageError, fetchNextPage } =
    noticesQuery
  useEffect(() => {
    const target = restoration
    if (!target || !data || isFetching || isFetchNextPageError) return
    const frame = requestAnimationFrame(() => {
      const maxScrollY = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      )
      if (
        hasNextPage &&
        (data.pages.length < target.pageCount || maxScrollY < target.scrollY)
      ) {
        void fetchNextPage()
        return
      }
      window.scrollTo({ top: target.scrollY })
      setRestoration(null)
    })
    return () => cancelAnimationFrame(frame)
  }, [
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchNextPageError,
    restoration,
  ])

  if (noticesQuery.isError && !noticesQuery.data) {
    throw noticesQuery.error
  }

  const notices = noticesQuery.data?.pages.flatMap((page) => page.notices) ?? []

  const handleNoticeClick = (noticeId: number) => {
    saveNoticeListState(noticesQuery.data?.pages.length ?? 1)
    navigate(getNoticeDetailPath(String(noticeId)), {
      state: { fromNoticeList: true },
    })
  }

  return (
    <div className="min-h-dvh bg-white pt-18.75">
      <Header
        className="app-mobile-fixed-top z-fixed fixed"
        leftAction={
          <IconButton
            aria-label="뒤로가기"
            onClick={() => navigate(ROUTES.mypage, { replace: true })}
            size="xs"
          >
            <BackIcon className="size-6" />
          </IconButton>
        }
        title="공지사항"
      />
      {noticesQuery.isPending ? (
        <LoadingScreen className="min-h-[calc(100dvh-159px)]" />
      ) : (
        <ul>
          {notices.map((notice) => (
            <li className="border-secondary-200 border-b" key={notice.noticeId}>
              <button
                className="flex w-full items-center justify-between gap-3 px-5 py-7 text-left"
                onClick={() => handleNoticeClick(notice.noticeId)}
                type="button"
              >
                <span className="flex min-w-0 flex-col gap-2">
                  <span className="typo-sub-header-2 truncate text-black">
                    {notice.title}
                  </span>
                  <span className="typo-body-6 text-primary-200">
                    {formatNoticeLastUpdatedDate(notice)}
                  </span>
                </span>
                <NextIcon aria-hidden="true" className="size-6 shrink-0" />
              </button>
            </li>
          ))}
          {noticesQuery.isFetchNextPageError ? (
            <li className="flex justify-center py-6">
              <button
                aria-label="다음 공지 다시 불러오기"
                className="typo-body-6 text-primary-200"
                onClick={() => void noticesQuery.fetchNextPage()}
                type="button"
              >
                다시 시도
              </button>
            </li>
          ) : noticesQuery.hasNextPage ? (
            <li aria-hidden="true" className="h-px" ref={loadMoreRef} />
          ) : null}
        </ul>
      )}
    </div>
  )
}
