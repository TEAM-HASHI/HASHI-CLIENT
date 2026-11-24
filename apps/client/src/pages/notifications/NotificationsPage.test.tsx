import { ToastRegion, toastQueue } from '@hashi/hds-ui'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { NotificationsPage } from '@/pages/notifications/NotificationsPage'
import { mockIntersectionObserver } from '@/test/mockIntersectionObserver'

const auth = vi.hoisted(() => ({ isAuthenticated: false }))
const startKakaoOAuth = vi.hoisted(() => vi.fn())
vi.mock('@/features/auth/hooks/useKakaoOAuthStart', () => ({
  useKakaoOAuthStart: () => ({ startKakaoOAuth }),
}))
vi.mock('@/shared/hooks/useAuthStatus', () => ({ useAuthStatus: () => auth }))

const renderPage = (entry = '/notifications?tab=notice') =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <NotificationsPage />
      <ToastRegion />
    </MemoryRouter>,
  )
const firstNotice = () =>
  screen.getByRole('button', { name: /하시의 공지사항 안내합니다/ })

beforeEach(() => {
  startKakaoOAuth.mockClear()
  auth.isAuthenticated = false
})
afterEach(() => {
  cleanup()
  toastQueue.clear()
  vi.unstubAllGlobals()
})

describe('NotificationsPage publishing', () => {
  it('defaults to news and allows guests to switch to service notices', () => {
    renderPage('/notifications')
    expect(screen.getByRole('tab', { name: '소식 알림' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    fireEvent.click(screen.getByRole('tab', { name: '서비스 공지' }))
    expect(firstNotice()).toBeVisible()
    expect(screen.getByRole('tab', { name: '서비스 공지' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('shows ten notices with all three types and loads ten more on intersection', async () => {
    const observer = mockIntersectionObserver()
    renderPage()
    expect(
      within(
        screen.getByRole('list', { name: '서비스 공지 목록' }),
      ).getAllByRole('listitem'),
    ).toHaveLength(10)
    expect(screen.getAllByText('공지').length).toBeGreaterThan(0)
    expect(screen.getAllByText('이벤트').length).toBeGreaterThan(0)
    expect(screen.getAllByText('업데이트').length).toBeGreaterThan(0)
    observer.triggerAllIntersects()
    await waitFor(() =>
      expect(
        within(
          screen.getByRole('list', { name: '서비스 공지 목록' }),
        ).getAllByRole('listitem'),
      ).toHaveLength(20),
    )
  })

  it('keeps a guest notice unread after opening detail and returning', () => {
    renderPage()
    fireEvent.click(firstNotice())
    expect(
      screen.getByRole('heading', {
        name: '[ 첫 출시 EVENT ] 하시의 공지사항 안내합니다.',
      }),
    ).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))
    expect(firstNotice()).toHaveAttribute('data-read', 'false')
  })

  it('marks a member notice read only after opening it and keeps it clickable', () => {
    auth.isAuthenticated = true
    renderPage()
    expect(firstNotice()).toHaveAttribute('data-read', 'false')
    fireEvent.click(firstNotice())
    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))
    expect(firstNotice()).toHaveAttribute('data-read', 'true')
    fireEvent.click(firstNotice())
    expect(
      screen.getByRole('heading', {
        name: '[ 첫 출시 EVENT ] 하시의 공지사항 안내합니다.',
      }),
    ).toBeVisible()
  })

  it('keeps loaded pages on detail return', async () => {
    const observer = mockIntersectionObserver()
    renderPage()
    observer.triggerAllIntersects()
    await waitFor(() =>
      expect(
        within(
          screen.getByRole('list', { name: '서비스 공지 목록' }),
        ).getAllByRole('listitem'),
      ).toHaveLength(20),
    )
    fireEvent.click(firstNotice())
    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))
    expect(
      within(
        screen.getByRole('list', { name: '서비스 공지 목록' }),
      ).getAllByRole('listitem'),
    ).toHaveLength(20)
  })

  it('shows initial error and restores the list when retried', () => {
    renderPage('/notifications?tab=notice&preview=error')
    expect(
      screen.getByText('정보를 불러오는 중 문제가 발생했어요.'),
    ).toBeVisible()
    expect(
      screen.queryByRole('list', { name: '서비스 공지 목록' }),
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '다시 시도하기' }))
    expect(firstNotice()).toBeVisible()
  })

  it('keeps existing notices on a next-page error and retries without duplicates', () => {
    renderPage('/notifications?tab=notice&preview=more-error')
    expect(firstNotice()).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: '다시 시도하기' }))
    expect(
      within(
        screen.getByRole('list', { name: '서비스 공지 목록' }),
      ).getAllByRole('listitem'),
    ).toHaveLength(20)
    expect(
      screen.queryByText('정보를 불러오는 중 문제가 발생했어요.'),
    ).not.toBeInTheDocument()
  })

  it('retries detail error into the same notice', () => {
    renderPage('/notifications?tab=notice&notice=1&preview=detail-error')
    fireEvent.click(screen.getByRole('button', { name: '다시 시도하기' }))
    expect(
      screen.getByRole('heading', {
        name: '[ 첫 출시 EVENT ] 하시의 공지사항 안내합니다.',
      }),
    ).toBeVisible()
  })

  it('removes an unavailable notice with a toast and keeps the service tab', () => {
    renderPage('/notifications?tab=notice&preview=unavailable')
    fireEvent.click(firstNotice())
    expect(screen.getByText('확인할 수 없는 공지예요')).toBeVisible()
    expect(
      screen.queryByRole('heading', {
        name: '[ 첫 출시 EVENT ] 하시의 공지사항 안내합니다.',
      }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /하시의 공지사항 안내합니다/ }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '서비스 공지' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('opens the reused image viewer from a detail attachment', () => {
    renderPage('/notifications?tab=notice&notice=1')
    fireEvent.click(
      screen.getByRole('button', { name: '첨부 이미지 1 크게 보기' }),
    )
    expect(
      screen.getByRole('dialog', { name: '공지 이미지 크게 보기' }),
    ).toBeVisible()
    fireEvent.click(
      screen.getByRole('button', { name: '공지 이미지 크게 보기 닫기' }),
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the same title and date in the list and detail', () => {
    renderPage()
    const button = firstNotice()
    const title = '[ 첫 출시 EVENT ] 하시의 공지사항 안내합니다.'
    expect(within(button).getByText('2026.06.29')).toBeVisible()
    fireEvent.click(button)
    expect(screen.getByRole('heading', { name: title })).toBeVisible()
    expect(screen.getByText('2026.06.29')).toBeVisible()
  })

  it('returns an unknown notice ID to the list with an unavailable toast', async () => {
    renderPage('/notifications?tab=notice&notice=999')
    await waitFor(() =>
      expect(screen.getByText('확인할 수 없는 공지예요')).toBeVisible(),
    )
    expect(firstNotice()).toBeVisible()
  })

  it('marks a directly opened member notice read after viewing it', () => {
    auth.isAuthenticated = true
    renderPage('/notifications?tab=notice&notice=1')
    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))
    expect(firstNotice()).toHaveAttribute('data-read', 'true')
  })

  it('does not mark a failed detail as read', () => {
    auth.isAuthenticated = true
    renderPage('/notifications?tab=notice&notice=1&preview=detail-error')
    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }))
    expect(firstNotice()).toHaveAttribute('data-read', 'false')
  })
})

describe('통합 소식 알림', () => {
  it('일반 비회원 진입에서 로그인 유도를 보여주고 소식 탭 복귀 경로를 전달한다', () => {
    renderPage('/notifications')
    fireEvent.click(screen.getByRole('button', { name: '카카오로 로그인하기' }))
    expect(startKakaoOAuth).toHaveBeenCalledWith('/notifications')
  })
  it('뉴스 fixture는 명시적 검수에서만 노출한다', () => {
    auth.isAuthenticated = true
    renderPage('/notifications')
    expect(
      screen.queryByRole('list', { name: '소식 알림 목록' }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('소식 알림은 준비 중이에요.')).toBeVisible()
  })
  it('탭 전환 후에도 읽음 상태와 추가 조회 개수를 유지한다', async () => {
    const observer = mockIntersectionObserver()
    renderPage('/notifications?previewNews=list&previewUser=member')
    const list = () => screen.getByRole('list', { name: '소식 알림 목록' })
    expect(within(list()).getAllByRole('listitem')).toHaveLength(10)
    fireEvent.click(
      screen.getByRole('button', { name: '안 읽음: 예약 요청이 접수되었어요' }),
    )
    observer.triggerAllIntersects()
    await waitFor(() =>
      expect(within(list()).getAllByRole('listitem')).toHaveLength(14),
    )
    fireEvent.click(screen.getByRole('tab', { name: '서비스 공지' }))
    expect(firstNotice()).toBeVisible()
    fireEvent.click(screen.getByRole('tab', { name: '소식 알림' }))
    expect(within(list()).getAllByRole('listitem')).toHaveLength(14)
    expect(
      screen.getByRole('button', { name: '읽음: 예약 요청이 접수되었어요' }),
    ).toBeEnabled()
  })
  it('소식 검수의 최초 조회 오류를 재시도한다', () => {
    renderPage('/notifications?previewNews=error&previewUser=member')
    fireEvent.click(screen.getByRole('button', { name: '다시 시도하기' }))
    expect(screen.getByRole('list', { name: '소식 알림 목록' })).toBeVisible()
  })
})
