export const createDayStart = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export const createMonthStart = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export const checkIsTodayOrBefore = (date: Date, today = new Date()) => {
  return createDayStart(date).getTime() <= createDayStart(today).getTime()
}

export const formatDateToLocalDateString = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
