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
  const maxUsablePoint = Math.min(availablePoint, paymentAmount)
  const [pointState, setPointState] = useState(() => ({
    maxUsablePoint,
    usedPoint: 0,
  }))

  if (pointState.maxUsablePoint !== maxUsablePoint) {
    setPointState({
      maxUsablePoint,
      usedPoint: Math.min(pointState.usedPoint, maxUsablePoint),
    })
  }

  const usedPoint = Math.min(pointState.usedPoint, maxUsablePoint)

  const applyUsedPoint = useCallback(
    (nextUsedPoint: number) => {
      setPointState({
        maxUsablePoint,
        usedPoint: Math.min(Math.max(0, nextUsedPoint), maxUsablePoint),
      })
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
