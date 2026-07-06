interface BusinessHours {
  open: string
  close: string
}

const convertTimeToMinutes = (time: string) => {
  const [hour = 0, minute = 0] = time.split(':').map(Number)

  return hour * 60 + minute
}

const formatMinutesToTime = (minutes: number) => {
  const hour = Math.floor(minutes / 60)
  const minute = minutes % 60

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export const createReservationTimeSlots = (
  businessHours: BusinessHours,
  intervalMinutes: number,
) => {
  const openMinutes = convertTimeToMinutes(businessHours.open)
  const closeMinutes = convertTimeToMinutes(businessHours.close)

  if (intervalMinutes <= 0 || openMinutes > closeMinutes) {
    return []
  }

  const slotCount = Math.floor((closeMinutes - openMinutes) / intervalMinutes)

  return Array.from({ length: slotCount + 1 }, (_, index) =>
    formatMinutesToTime(openMinutes + index * intervalMinutes),
  )
}
