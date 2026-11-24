import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { NotificationNewsPanel } from '@/pages/notifications/components/news/NotificationNewsPanel'
import type {
  NewsNotification,
  NotificationNewsState,
} from '@/pages/notifications/types/notificationNews'

afterEach(cleanup)

const notification: NewsNotification = {
  id: 'one',
  kind: 'feeRefunded',
  reservationId: '42',
  title: '예약 수수료가 환불됐어요',
  description: '입금하신 계좌로 보내드렸어요.',
  createdAt: '2026-11-24T00:00:00Z',
  isRead: false,
}
const success: NotificationNewsState = {
  status: 'success',
  notifications: [notification],
  hasNextPage: false,
  isFetchingNextPage: false,
  isFetchNextPageError: false,
}
const setup = (state: NotificationNewsState) => {
  const onSelect = vi.fn(),
    onLogin = vi.fn(),
    onRetry = vi.fn(),
    onLoadMore = vi.fn()
  render(
    <NotificationNewsPanel
      state={state}
      now={Date.parse('2026-11-24T01:00:00Z')}
      onSelect={onSelect}
      onLogin={onLogin}
      onRetry={onRetry}
      onLoadMore={onLoadMore}
      renderError={(retry) => (
        <div role="alert">
          <button onClick={retry}>다시 시도하기</button>
        </div>
      )}
    />,
  )
  return { onSelect, onLogin, onRetry, onLoadMore }
}

describe('소식 알림 패널', () => {
  it('목록 조회만으로 선택·읽음 처리를 요청하지 않는다', () => {
    const { onSelect } = setup(success)
    expect(
      screen.getByRole('button', { name: '안 읽음: 예약 수수료가 환불됐어요' }),
    ).toBeEnabled()
    expect(screen.getByText('1시간 전')).toBeInTheDocument()
    expect(onSelect).not.toHaveBeenCalled()
  })
  it('환불 알림을 누르면 예약 상세 목적지를 전달한다', () => {
    const { onSelect } = setup(success)
    fireEvent.click(
      screen.getByRole('button', { name: '안 읽음: 예약 수수료가 환불됐어요' }),
    )
    expect(onSelect).toHaveBeenCalledWith(notification, {
      kind: 'reservationDetail',
      reservationId: '42',
    })
  })
  it('읽은 알림도 다시 선택할 수 있다', () => {
    const read = { ...notification, isRead: true }
    const { onSelect } = setup({ ...success, notifications: [read] })
    fireEvent.click(
      screen.getByRole('button', { name: '읽음: 예약 수수료가 환불됐어요' }),
    )
    expect(onSelect).toHaveBeenCalledWith(read, {
      kind: 'reservationDetail',
      reservationId: '42',
    })
  })
  it('비회원은 소식을 노출하지 않고 로그인 액션을 제공한다', () => {
    const { onLogin } = setup({ status: 'guest' })
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '카카오로 로그인하기' }))
    expect(onLogin).toHaveBeenCalledOnce()
  })
  it('첫 조회 중에는 빈 상태를 잠깐 노출하지 않는다', () => {
    setup({ status: 'loading' })
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(
      screen.queryByText('아직 받은 알림이 없어요'),
    ).not.toBeInTheDocument()
  })
  it('첫 조회 오류는 전체 재시도 액션을 제공한다', () => {
    const { onRetry, onLoadMore } = setup({ status: 'error' })
    fireEvent.click(screen.getByRole('button', { name: '다시 시도하기' }))
    expect(onRetry).toHaveBeenCalledOnce()
    expect(onLoadMore).not.toHaveBeenCalled()
  })
  it('성공한 빈 목록에서만 빈 안내를 표시한다', () => {
    setup({ ...success, notifications: [] })
    expect(screen.getByText('아직 받은 알림이 없어요')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: '다시 시도하기' }),
    ).not.toBeInTheDocument()
  })
  it('추가 조회 실패 시 기존 목록을 보존하고 추가 조회만 재시도한다', () => {
    const { onLoadMore, onRetry } = setup({
      ...success,
      hasNextPage: true,
      isFetchNextPageError: true,
    })
    expect(
      screen.getByRole('button', { name: '안 읽음: 예약 수수료가 환불됐어요' }),
    ).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: '다시 시도하기' }))
    expect(onLoadMore).toHaveBeenCalledOnce()
    expect(onRetry).not.toHaveBeenCalled()
  })
  it('추가 조회 중에는 수동 중복 요청 버튼이 없다', () => {
    setup({ ...success, hasNextPage: true, isFetchingNextPage: true })
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: '알림 더 보기' }),
    ).not.toBeInTheDocument()
  })
  it('스크린리더 설명에 본문과 알림 시각을 함께 제공한다', () => {
    setup(success)
    expect(
      screen.getByRole('button', { name: '안 읽음: 예약 수수료가 환불됐어요' }),
    ).toHaveAccessibleDescription('입금하신 계좌로 보내드렸어요. 1시간 전')
  })
  it('추가 조회 재시도 중에는 이전 오류 CTA를 다시 실행할 수 없다', () => {
    setup({
      ...success,
      hasNextPage: true,
      isFetchNextPageError: true,
      isFetchingNextPage: true,
    })
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: '다시 시도하기' }),
    ).not.toBeInTheDocument()
  })
})
