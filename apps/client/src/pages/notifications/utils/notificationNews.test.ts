import { describe, expect, it } from 'vitest'

import {
  formatNotificationTime,
  getNotificationDestination,
} from '@/pages/notifications/utils/notificationNews'
import type { NewsNotification } from '@/pages/notifications/types/notificationNews'

const now = Date.parse('2026-11-24T00:00:00Z')
const base = {
  id: 'n-1',
  title: '예약 소식',
  description: '발송 당시 내용',
  createdAt: '2026-11-23T23:00:00Z',
  isRead: false,
}

describe('소식 알림 경과 시간', () => {
  it.each([
    [0, '방금 전'],
    [59_999, '방금 전'],
    [60_000, '1분 전'],
    [3_599_999, '59분 전'],
    [3_600_000, '1시간 전'],
    [86_399_999, '23시간 전'],
    [86_400_000, '1일 전'],
    [604_799_999, '6일 전'],
    [604_800_000, '2026.11.17'],
  ])('%i ms 경과 시 %s', (elapsed, expected) => {
    expect(
      formatNotificationTime(new Date(now - elapsed).toISOString(), now),
    ).toBe(expected)
  })
  it('7일 이상이면 UTC 날짜가 아닌 한국 날짜를 표시한다', () => {
    expect(formatNotificationTime('2026-11-01T15:30:00Z', now)).toBe(
      '2026.11.02',
    )
  })
  it('잘못된 날짜를 날짜처럼 표시하지 않는다', () => {
    expect(formatNotificationTime('not-a-date', now)).toBe('-')
    expect(formatNotificationTime(base.createdAt, Number.NaN)).toBe('-')
  })
  it('미래 시각은 음수로 표시하지 않는다', () => {
    expect(formatNotificationTime('2026-11-25T00:00:00Z', now)).toBe('방금 전')
  })
})

describe('소식 알림 선택 목적지', () => {
  it.each([
    'reservationRequested',
    'newTimeRequested',
    'reservationChecking',
    'feeRefunded',
    'reservationConfirmed',
    'visitReminder',
    'canceledByUser',
    'canceledByRestaurant',
    'paymentExpired',
  ] as const)('%s 알림은 예약 상세를 연다', (kind) => {
    expect(
      getNotificationDestination({ ...base, kind, reservationId: '42' }),
    ).toEqual({ kind: 'reservationDetail', reservationId: '42' })
  })
  it.each(['paymentRequested', 'paymentReminder'] as const)(
    '%s: 입금 대기 중에만 입금 안내로 이동한다',
    (kind) => {
      expect(
        getNotificationDestination({
          ...base,
          kind,
          reservationId: '42',
          paymentState: 'awaiting',
        }),
      ).toEqual({ kind: 'paymentInfo', reservationId: '42' })
      for (const paymentState of ['paid', 'expired'] as const) {
        expect(
          getNotificationDestination({
            ...base,
            kind,
            reservationId: '42',
            paymentState,
          }),
        ).toEqual({ kind: 'reservationDetail', reservationId: '42' })
      }
    },
  )
  it('예약 진행 불가는 대안 추천으로 연결한다', () => {
    expect(
      getNotificationDestination({
        ...base,
        kind: 'reservationUnavailable',
        reservationId: '42',
      }),
    ).toEqual({ kind: 'reservationAlternatives', reservationId: '42' })
  })
  it('리뷰 요청은 해당 예약과 식당의 리뷰 작성으로 연결한다', () => {
    const notification: NewsNotification = {
      ...base,
      kind: 'reviewRequested',
      reservationId: '42',
      restaurantId: '7',
      isReviewWritten: false,
    }
    expect(getNotificationDestination(notification)).toEqual({
      kind: 'reviewWrite',
      restaurantId: '7',
      reservationId: '42',
    })
    expect(
      getNotificationDestination({ ...notification, isReviewWritten: true }),
    ).toEqual({ kind: 'reservationDetail', reservationId: '42' })
  })
  it('포인트 지급은 마이페이지로 연결한다', () => {
    expect(
      getNotificationDestination({ ...base, kind: 'pointsGranted' }),
    ).toEqual({ kind: 'mypage' })
  })
})
