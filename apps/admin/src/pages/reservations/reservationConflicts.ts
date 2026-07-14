import type { AdminReservationView } from '@/shared/api/reservationViewModel'

const getConflictKey = (reservation: AdminReservationView) => {
  if (
    reservation.reservationStatus === 'CANCELED' ||
    reservation.restaurantId <= 0 ||
    reservation.reservedAt.length < 16
  ) {
    return null
  }

  return `${reservation.restaurantId}:${reservation.reservedAt.slice(0, 16)}`
}

export const getReservationConflictCounts = (
  reservations: AdminReservationView[],
): Map<number, number> => {
  const reservationIdsByConflictKey = new Map<string, number[]>()

  reservations.forEach((reservation) => {
    const conflictKey = getConflictKey(reservation)

    if (!conflictKey) {
      return
    }

    const reservationIds = reservationIdsByConflictKey.get(conflictKey) ?? []
    reservationIds.push(reservation.id)
    reservationIdsByConflictKey.set(conflictKey, reservationIds)
  })

  return new Map(
    [...reservationIdsByConflictKey.values()]
      .filter((reservationIds) => reservationIds.length > 1)
      .flatMap((reservationIds) =>
        reservationIds.map(
          (reservationId) => [reservationId, reservationIds.length] as const,
        ),
      ),
  )
}
