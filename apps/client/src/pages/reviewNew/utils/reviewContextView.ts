const formatTwoDigit = (value: number) => String(value).padStart(2, '0')

export const formatReviewVisitedAt = (visitedAt: string | undefined) => {
  if (!visitedAt) {
    return '방문 일시 정보 없음'
  }

  const date = new Date(visitedAt)

  if (Number.isNaN(date.getTime())) {
    return '방문 일시 정보 없음'
  }

  return `${date.getFullYear()}. ${
    date.getMonth() + 1
  }. ${date.getDate()} ${formatTwoDigit(date.getHours())}:${formatTwoDigit(
    date.getMinutes(),
  )} 방문`
}

export const formatReviewGuestSummary = ({
  adultCount = 0,
  teenCount = 0,
  childCount = 0,
}: {
  adultCount?: number
  teenCount?: number
  childCount?: number
}) => {
  const guestParts = [
    adultCount > 0 ? `어른 ${adultCount}명` : null,
    teenCount > 0 ? `청소년 ${teenCount}명` : null,
    childCount > 0 ? `어린이 ${childCount}명` : null,
  ].filter((part): part is string => part !== null)

  return guestParts.length > 0 ? guestParts.join(' · ') : '방문 인원 정보 없음'
}
