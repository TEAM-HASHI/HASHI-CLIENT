import type { NewsNotification } from '@/pages/notifications/types/notificationNews'

/** 개발 전용 검수 화면에서만 import한다. 실제 사용자 알림이 아니다. */
export const createNotificationNewsFixtures = (
  now: number,
): NewsNotification[] => {
  const base = (index: number, title: string, description: string) => ({
    id: `news-preview-${index}`,
    title,
    description,
    createdAt: new Date(now - index * 3600000).toISOString(),
    isRead: false,
  })
  return [
    {
      ...base(
        1,
        '예약 요청이 접수되었어요',
        '예약이 확정되면 다시 알려드릴게요.',
      ),
      kind: 'reservationRequested',
      reservationId: 'preview-1',
    },
    {
      ...base(
        2,
        '새 시간으로 예약 요청이 접수됐어요',
        '[이치키누 하카다 부가다] 11월 12일 오후 8시',
      ),
      kind: 'newTimeRequested',
      reservationId: 'preview-2',
    },
    {
      ...base(
        3,
        '식당에 예약을 확인해보고 있어요',
        '[이치키누 하카다 부가다] 예약 가능 여부를 확인 중이에요.',
      ),
      kind: 'reservationChecking',
      reservationId: 'preview-3',
    },
    {
      ...base(
        4,
        '예약이 가능해요. 수수료를 입금해 주세요',
        '[이치키누 하카다 부가다] 내일 오후 2시까지 입금해 주세요.',
      ),
      kind: 'paymentRequested',
      reservationId: 'preview-4',
      paymentState: 'awaiting',
    },
    {
      ...base(
        5,
        '입금 기한이 3시간 남았어요',
        '[이치키누 하카다 부가다] 오늘 오후 2시까지 입금해 주세요.',
      ),
      kind: 'paymentReminder',
      reservationId: 'preview-5',
      paymentState: 'awaiting',
    },
    {
      ...base(
        6,
        '예약 수수료 4,000원이 환불됐어요',
        '입금하신 계좌로 보내드렸어요.',
      ),
      kind: 'feeRefunded',
      reservationId: 'preview-6',
    },
    {
      ...base(
        7,
        '입금이 확인되어 예약이 확정됐어요',
        '[이치키누 하카다 부가다] 10월 28일 오후 7시',
      ),
      kind: 'reservationConfirmed',
      reservationId: 'preview-7',
    },
    {
      ...base(
        8,
        '요청하신 예약은 진행이 어려워요',
        '대신 예약 가능한 다른 시간과 추천 식당을 준비했어요.',
      ),
      kind: 'reservationUnavailable',
      reservationId: 'preview-8',
    },
    {
      ...base(
        9,
        '내일은 식당 방문일이에요!',
        '방문 전 예약 정보를 다시 확인해 주세요.',
      ),
      kind: 'visitReminder',
      reservationId: 'preview-9',
    },
    {
      ...base(
        10,
        '요청하신 예약이 취소되었어요',
        '취소 내역은 내 예약에서 확인할 수 있어요.',
      ),
      kind: 'canceledByUser',
      reservationId: 'preview-10',
    },
    {
      ...base(
        11,
        '식당 사정으로 예약이 취소됐어요',
        '취소 내역은 내 예약에서 확인할 수 있어요.',
      ),
      kind: 'canceledByRestaurant',
      reservationId: 'preview-11',
    },
    {
      ...base(
        12,
        '입금 기한이 지나 예약이 취소됐어요',
        '취소 내역은 내 예약에서 확인할 수 있어요.',
      ),
      kind: 'paymentExpired',
      reservationId: 'preview-12',
    },
    {
      ...base(
        13,
        '식사는 어떠셨나요?',
        '리뷰를 작성하고 포인트 +500원을 받아가세요.',
      ),
      kind: 'reviewRequested',
      reservationId: 'preview-13',
      restaurantId: 'preview-restaurant',
      isReviewWritten: false,
    },
    {
      ...base(14, '포인트 지급이 완료되었어요', '다음 예약에서 사용해보세요!'),
      kind: 'pointsGranted',
    },
  ]
}
