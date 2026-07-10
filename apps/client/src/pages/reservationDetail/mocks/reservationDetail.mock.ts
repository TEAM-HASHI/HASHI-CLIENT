import {
  addDays,
  formatDotDateTime,
  formatMonthDay,
  formatMonthDayTime,
} from '@/shared/utils'

const reservationRequestedAt = new Date('2026-06-21T13:44:00')
const reservationEstimatedConfirmedAt = addDays(reservationRequestedAt, 2)

const receivedStep = {
  id: 'received',
  title: '예약 접수',
  description: '예약 요청이 접수되었어요',
  requestedAt: formatMonthDayTime(reservationRequestedAt),
} as const

const contactingStep = {
  id: 'contacting',
  title: '식당 컨택 중',
  description: '식당에 예약 가능 여부를 확인하고 있어요',
} as const

const confirmedStep = {
  id: 'confirmed',
  title: '예약 확정',
  description: '예약이 성공적으로 확정되었어요',
} as const

// TODO: API 연동 후 제거 예정
export const reservationProgressSteps = [
  {
    ...receivedStep,
    status: 'completed',
  },
  {
    ...contactingStep,
    status: 'current',
  },
  {
    ...confirmedStep,
    requestedAt: `예정 ${formatMonthDay(reservationEstimatedConfirmedAt)}`,
    status: 'pending',
  },
] as const

export const reservationRestaurant = {
  name: '야키니쿠 리키마루 이케부쿠로 히가시구치 텐',
  localName: '焼肉力丸 池袋東口店焼肉力丸',
} as const

export const reservationReceiptInfoItems = [
  {
    label: '예약자',
    value: '김하시',
  },
  {
    label: '인원',
    value: '어른 2명',
  },
  {
    label: '식당 주소',
    value: '야키니쿠 리키마루 이케부쿠로 히가시 구치 텐',
  },
  {
    label: '식당 방문 일정',
    value: formatDotDateTime(new Date('2026-06-01T11:00:00')),
  },
  {
    label: '수수료',
    value: '4000원',
  },
] as const
