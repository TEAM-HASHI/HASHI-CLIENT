interface FormatWonOptions {
  useGrouping?: boolean
}

export const formatWon = (
  amount: number,
  { useGrouping = true }: FormatWonOptions = {},
) => {
  return `${new Intl.NumberFormat('ko-KR', { useGrouping }).format(amount)}원`
}
