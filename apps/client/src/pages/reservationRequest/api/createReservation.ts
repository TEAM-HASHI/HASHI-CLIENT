import type { components } from '@/shared/api/generated/openapi'
import { request } from '@/shared/api'

import type { ReservationRequestDraft } from '@/pages/reservationRequest/hooks/useReservationRequestDraft'

type CreateReservationRequest =
  components['schemas']['CreateReservationRequest']
type CreateAnywhereReservationRequest =
  components['schemas']['CreateAnywhereReservationRequest']
type ReservationResponse = components['schemas']['ReservationResponse']

interface CreateReservationParams {
  draft: ReservationRequestDraft
  usedPoint: number
}

const ANYWHERE_RESERVATION_FEE = 4_000

const createReservedAt = (draft: ReservationRequestDraft) =>
  `${draft.date}T${draft.time}:00`

const createCommonRequest = (
  draft: ReservationRequestDraft,
  usedPoint: number,
) => {
  const reservationFee =
    draft.source === 'anywhere'
      ? ANYWHERE_RESERVATION_FEE
      : draft.reservationFee

  return {
    reserverName: draft.guestName,
    reservedAt: createReservedAt(draft),
    adultCount: draft.guests.adult,
    teenCount: draft.guests.teen,
    childCount: draft.guests.child,
    ...(draft.requestNote.trim()
      ? { requestNote: draft.requestNote.trim() }
      : {}),
    usedPoint,
    amount: reservationFee - usedPoint,
  }
}

const checkHasReservationId = (
  response: ReservationResponse | null,
): response is ReservationResponse & { reservationId: number } =>
  typeof response?.reservationId === 'number'

export const createReservation = async ({
  draft,
  usedPoint,
}: CreateReservationParams) => {
  let response: ReservationResponse | null

  if (draft.source === 'anywhere') {
    const requestBody: CreateAnywhereReservationRequest = {
      ...createCommonRequest(draft, usedPoint),
      restaurantName: draft.restaurantName,
      restaurantAddress: draft.restaurantAddress,
    }

    response = await request<ReservationResponse>(
      '/api/v1/reservations/anywhere',
      {
        json: requestBody,
        method: 'post',
      },
    )
  } else {
    const restaurantId = Number(draft.restaurantId)

    if (!Number.isSafeInteger(restaurantId) || restaurantId <= 0) {
      throw new Error('유효하지 않은 식당 ID입니다.')
    }

    const requestBody: CreateReservationRequest = {
      ...createCommonRequest(draft, usedPoint),
      restaurantId,
    }

    response = await request<ReservationResponse>('/api/v1/reservations', {
      json: requestBody,
      method: 'post',
    })
  }

  if (!checkHasReservationId(response)) {
    throw new Error('예약 생성 응답에 예약 ID가 없습니다.')
  }

  return response
}
