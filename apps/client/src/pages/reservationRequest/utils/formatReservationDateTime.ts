interface FormatReservationDateTimeParams {
  date: string
  time: string
}

export const formatReservationDateTime = ({
  date,
  time,
}: FormatReservationDateTimeParams) => {
  const [year, month, day] = date.split('-').map(Number)

  if (!year || !month || !day) {
    return `${date} ${time}`
  }

  return `${year}.${month}.${day}. ${time}`
}
