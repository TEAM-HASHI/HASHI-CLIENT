import { useCallback, useMemo, useState } from 'react'

interface UseReservationPointParams {
  availablePoint: number
  paymentAmount: number
}

const extractPointNumber = (value: string) => {
  const numericValue = value.replace(/\D/g, '')

  if (!numericValue) {
    return 0
  }

  return Number(numericValue)
}

export const useReservationPoint = ({
  availablePoint,
  paymentAmount,
}: UseReservationPointParams) => {
  const [usedPoint, setUsedPoint] = useState(0)

  const maxUsablePoint = Math.min(availablePoint, paymentAmount)

  const applyUsedPoint = useCallback(
    (nextUsedPoint: number) => {
      setUsedPoint(Math.min(Math.max(0, nextUsedPoint), maxUsablePoint))
    },
    [maxUsablePoint],
  )

  const handlePointInputChange = useCallback(
    (value: string) => {
      applyUsedPoint(extractPointNumber(value))
    },
    [applyUsedPoint],
  )

  const handleUseAllPointsClick = useCallback(() => {
    applyUsedPoint(maxUsablePoint)
  }, [applyUsedPoint, maxUsablePoint])

  const remainingPoint = availablePoint - usedPoint
  const finalPaymentAmount = Math.max(0, paymentAmount - usedPoint)

  return useMemo(
    () => ({
      usedPoint,
      remainingPoint,
      finalPaymentAmount,
      onPointInputChange: handlePointInputChange,
      onUseAllPointsClick: handleUseAllPointsClick,
    }),
    [
      finalPaymentAmount,
      handlePointInputChange,
      handleUseAllPointsClick,
      remainingPoint,
      usedPoint,
    ],
  )
}
