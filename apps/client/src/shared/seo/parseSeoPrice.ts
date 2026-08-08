export const parseSeoPrice = (displayPrice: string) => {
  const normalizedPrice = displayPrice.replaceAll(',', '').trim()

  if (!normalizedPrice) {
    return undefined
  }

  const price = Number(normalizedPrice)
  return Number.isFinite(price) && price >= 0 ? price : undefined
}
