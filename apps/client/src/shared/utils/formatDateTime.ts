export const formatMonthDayTime = (date: Date) => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${month}월 ${day}일 ${hours}:${minutes}`
}

export const formatMonthDay = (date: Date) => {
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${month}월 ${day}일`
}

export const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)

  return nextDate
}

export const formatDotDateTime = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}.${month}.${day}. ${hours}:${minutes}`
}
