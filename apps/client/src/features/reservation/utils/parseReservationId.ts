export const parseReservationId = (reservationId: string | undefined) => {
  if (!reservationId) {
    return null
  }

  const parsedReservationId = Number(reservationId)

  return Number.isSafeInteger(parsedReservationId) && parsedReservationId > 0
    ? parsedReservationId
    : null
}
