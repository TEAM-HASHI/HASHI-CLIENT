export const getPhotoIndicatorState = (total: number, index: number) => {
  const dotCount = Math.min(total, 6)
  const currentDot =
    total > 0
      ? Math.min(dotCount - 1, Math.floor((index * dotCount) / total))
      : 0

  return { dotCount, currentDot }
}
