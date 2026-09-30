import type { components } from '@/shared/api/generated/openapi'

export type ReservationCompletionResponse =
  components['schemas']['ReservationResponse']

export const reservationCompletionQueryKeys = {
  detail: (reservationId: number | null) =>
    ['reservation', 'completion', reservationId] as const,
}

export const checkIsReservationCompletionResponse = (
  response: ReservationCompletionResponse | undefined,
  reservationId: number | null,
): response is ReservationCompletionResponse => {
  if (
    !response ||
    reservationId === null ||
    response.reservationId !== reservationId
  )
    return false
  const counts = [response.adultCount, response.teenCount, response.childCount]
  return Boolean(
    response.reserverName?.trim() &&
    response.restaurantAddress?.trim() &&
    response.reservedAt &&
    Number.isFinite(Date.parse(response.reservedAt)) &&
    response.reservationStatus &&
    counts.every(
      (count) =>
        typeof count === 'number' &&
        Number.isInteger(count) &&
        count >= 0 &&
        count <= 100,
    ) &&
    counts.reduce<number>((total, count) => total + (count ?? 0), 0) > 0,
  )
}
